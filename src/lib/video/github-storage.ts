/**
 * GitHub Video Storage Integration
 * Store and serve videos using GitHub repository
 * Free alternative to Cloudflare Stream and Mux
 */

interface GitHubConfig {
  owner: string;
  repo: string;
  token: string;
  branch?: string;
}

export class GitHubVideoStorage {
  private config: GitHubConfig;
  private baseUrl: string;

  constructor() {
    this.config = {
      owner: process.env.GITHUB_REPO_OWNER || "",
      repo: process.env.GITHUB_REPO_NAME || "",
      token: process.env.GITHUB_TOKEN || "",
      branch: process.env.GITHUB_BRANCH || "main",
    };

    this.baseUrl = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}`;
  }

  /**
   * Check if GitHub storage is configured
   */
  isConfigured(): boolean {
    return !!(this.config.owner && this.config.repo && this.config.token);
  }

  /**
   * Upload video to GitHub repository
   * Note: GitHub has a 100MB file limit per file
   * For larger files, consider chunking or using Git LFS
   */
  async uploadVideo(
    file: File | Buffer,
    fileName: string,
    path: string = "videos"
  ): Promise<{
    url: string;
    downloadUrl: string;
    rawUrl: string;
    htmlUrl: string;
    sha: string;
  }> {
    if (!this.isConfigured()) {
      throw new Error("GitHub storage not configured");
    }

    try {
      // Convert file to base64
      let base64Content: string;
      
      if (Buffer.isBuffer(file)) {
        base64Content = file.toString("base64");
      } else {
        // File from browser
        const arrayBuffer = await (file as File).arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        base64Content = buffer.toString("base64");
      }

      // Clean filename
      const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
      const filePath = `${path}/${cleanFileName}`;

      // Check if file exists
      const existingFile = await this.getFile(filePath).catch(() => null);

      // Upload to GitHub
      const response = await fetch(
        `${this.baseUrl}/contents/${filePath}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${this.config.token}`,
            "Content-Type": "application/json",
            Accept: "application/vnd.github.v3+json",
          },
          body: JSON.stringify({
            message: existingFile
              ? `Update video: ${cleanFileName}`
              : `Add video: ${cleanFileName}`,
            content: base64Content,
            branch: this.config.branch,
            ...(existingFile && { sha: existingFile.sha }),
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          `GitHub upload failed: ${error.message || response.statusText}`
        );
      }

      const data = await response.json();

      return {
        url: data.content.url,
        downloadUrl: data.content.download_url,
        rawUrl: data.content.download_url, // Same as download_url for raw content
        htmlUrl: data.content.html_url,
        sha: data.content.sha,
      };
    } catch (error) {
      console.error("GitHub upload error:", error);
      throw error;
    }
  }

  /**
   * Get file information from GitHub
   */
  async getFile(filePath: string): Promise<{
    sha: string;
    size: number;
    url: string;
    download_url: string;
  }> {
    if (!this.isConfigured()) {
      throw new Error("GitHub storage not configured");
    }

    const response = await fetch(
      `${this.baseUrl}/contents/${filePath}?ref=${this.config.branch}`,
      {
        headers: {
          Authorization: `Bearer ${this.config.token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`File not found: ${filePath}`);
    }

    return response.json();
  }

  /**
   * Delete video from GitHub
   */
  async deleteVideo(filePath: string): Promise<boolean> {
    if (!this.isConfigured()) {
      throw new Error("GitHub storage not configured");
    }

    try {
      // Get file SHA
      const file = await this.getFile(filePath);

      const response = await fetch(
        `${this.baseUrl}/contents/${filePath}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${this.config.token}`,
            "Content-Type": "application/json",
            Accept: "application/vnd.github.v3+json",
          },
          body: JSON.stringify({
            message: `Delete video: ${filePath}`,
            sha: file.sha,
            branch: this.config.branch,
          }),
        }
      );

      return response.ok;
    } catch (error) {
      console.error("GitHub delete error:", error);
      return false;
    }
  }

  /**
   * List all videos in a directory
   */
  async listVideos(path: string = "videos"): Promise<
    Array<{
      name: string;
      path: string;
      size: number;
      download_url: string;
      html_url: string;
    }>
  > {
    if (!this.isConfigured()) {
      throw new Error("GitHub storage not configured");
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/contents/${path}?ref=${this.config.branch}`,
        {
          headers: {
            Authorization: `Bearer ${this.config.token}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      if (!response.ok) {
        return [];
      }

      const files = await response.json();
      
      // Filter video files
      return files.filter((file: any) => 
        file.type === "file" && 
        /\.(mp4|mov|avi|webm|mkv)$/i.test(file.name)
      );
    } catch (error) {
      console.error("GitHub list error:", error);
      return [];
    }
  }

  /**
   * Get public URL for video playback
   * Uses raw.githubusercontent.com for direct video streaming
   */
  getPublicUrl(filePath: string): string {
    // Remove leading 'videos/' if present since we'll add the full path
    const cleanPath = filePath.startsWith('videos/') ? filePath : `videos/${filePath}`;
    return `https://raw.githubusercontent.com/${this.config.owner}/${this.config.repo}/${this.config.branch}/${cleanPath}`;
  }

  /**
   * Generate upload metadata for client-side upload preparation
   */
  async prepareUpload(fileName: string): Promise<{
    fileName: string;
    path: string;
    uploadUrl: string;
    provider: string;
  }> {
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}_${cleanFileName}`;
    const path = `videos/${uniqueFileName}`;

    return {
      fileName: uniqueFileName,
      path,
      uploadUrl: `${this.baseUrl}/contents/${path}`,
      provider: "github",
    };
  }
}

export const githubStorage = new GitHubVideoStorage();
