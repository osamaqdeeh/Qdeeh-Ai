/**
 * Cloudflare Stream Integration
 * Documentation: https://developers.cloudflare.com/stream/
 */

interface CloudflareStreamResponse {
  success: boolean;
  result?: {
    uid: string;
    preview: string;
    thumbnail: string;
    playback: {
      hls: string;
      dash: string;
    };
    status: {
      state: string;
      pctComplete: number;
    };
  };
  errors?: Array<{ message: string }>;
}

export class CloudflareStreamService {
  private accountId: string;
  private apiToken: string;
  private baseUrl: string;

  constructor() {
    this.accountId = process.env.CLOUDFLARE_ACCOUNT_ID || "";
    this.apiToken = process.env.CLOUDFLARE_STREAM_API_TOKEN || "";
    this.baseUrl = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/stream`;

    if (!this.accountId || !this.apiToken) {
      console.warn("Cloudflare Stream credentials not configured");
    }
  }

  /**
   * Upload video from URL
   */
  async uploadFromUrl(url: string, metadata?: { name?: string }): Promise<string | null> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          meta: metadata,
          requireSignedURLs: true, // Enable signed URLs for security
        }),
      });

      const data: CloudflareStreamResponse = await response.json();

      if (data.success && data.result) {
        return data.result.uid;
      }

      console.error("Cloudflare Stream upload error:", data.errors);
      return null;
    } catch (error) {
      console.error("Cloudflare Stream upload error:", error);
      return null;
    }
  }

  /**
   * Upload video from file (multipart)
   */
  async uploadFromFile(file: File): Promise<string | null> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("requireSignedURLs", "true");

      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiToken}`,
        },
        body: formData,
      });

      const data: CloudflareStreamResponse = await response.json();

      if (data.success && data.result) {
        return data.result.uid;
      }

      console.error("Cloudflare Stream upload error:", data.errors);
      return null;
    } catch (error) {
      console.error("Cloudflare Stream upload error:", error);
      return null;
    }
  }

  /**
   * Get video details
   */
  async getVideo(videoId: string): Promise<CloudflareStreamResponse["result"] | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${videoId}`, {
        headers: {
          "Authorization": `Bearer ${this.apiToken}`,
        },
      });

      const data: CloudflareStreamResponse = await response.json();

      if (data.success && data.result) {
        return data.result;
      }

      return null;
    } catch (error) {
      console.error("Cloudflare Stream get video error:", error);
      return null;
    }
  }

  /**
   * Delete video
   */
  async deleteVideo(videoId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/${videoId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${this.apiToken}`,
        },
      });

      const data: CloudflareStreamResponse = await response.json();
      return data.success;
    } catch (error) {
      console.error("Cloudflare Stream delete error:", error);
      return false;
    }
  }

  /**
   * Generate signed URL for protected video playback
   */
  async getSignedUrl(videoId: string, expiresIn: number = 3600): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${videoId}/token`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exp: Math.floor(Date.now() / 1000) + expiresIn,
        }),
      });

      const data = await response.json();

      if (data.success && data.result?.token) {
        return `https://customer-${this.accountId}.cloudflarestream.com/${videoId}/manifest/video.m3u8?token=${data.result.token}`;
      }

      return null;
    } catch (error) {
      console.error("Cloudflare Stream signed URL error:", error);
      return null;
    }
  }

  /**
   * Get upload URL for direct upload from client
   */
  async getUploadUrl(): Promise<{ uploadUrl: string; videoId: string } | null> {
    try {
      const response = await fetch(`${this.baseUrl}/direct_upload`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          maxDurationSeconds: 3600, // 1 hour max
          requireSignedURLs: true,
        }),
      });

      const data = await response.json();

      if (data.success && data.result) {
        return {
          uploadUrl: data.result.uploadURL,
          videoId: data.result.uid,
        };
      }

      return null;
    } catch (error) {
      console.error("Cloudflare Stream get upload URL error:", error);
      return null;
    }
  }
}

export const cloudflareStream = new CloudflareStreamService();
