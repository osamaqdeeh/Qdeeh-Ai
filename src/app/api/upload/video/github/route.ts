import { requireAdmin } from "@/lib/auth-helpers";
import { NextResponse } from "next/server";
import { githubStorage } from "@/lib/video/github-storage";

/**
 * Upload video directly to GitHub repository
 * This is the actual upload endpoint for GitHub storage
 */
export async function POST(request: Request) {
  try {
    await requireAdmin();

    if (!githubStorage.isConfigured()) {
      return NextResponse.json(
        { error: "GitHub storage not configured" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const fileName = formData.get("fileName") as string || file?.name;
    const lessonId = formData.get("lessonId") as string;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Check file size (GitHub has 100MB limit per file)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { 
          error: "File too large. GitHub has a 100MB limit per file. Please use a smaller video or enable Git LFS.",
          maxSize: "100MB",
          fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`
        },
        { status: 400 }
      );
    }

    // Upload to GitHub
    const result = await githubStorage.uploadVideo(file, fileName);

    // Get the public URL for playback
    // Extract just the filename from the result
    const pathParts = result.htmlUrl.split('/');
    const filename = pathParts[pathParts.length - 1];
    const videoUrl = githubStorage.getPublicUrl(filename);

    return NextResponse.json({
      success: true,
      videoUrl,
      downloadUrl: result.downloadUrl,
      rawUrl: result.rawUrl,
      htmlUrl: result.htmlUrl,
      sha: result.sha,
      provider: "github",
      lessonId,
      message: "Video uploaded to GitHub successfully! 🎉 (Free hosting)",
    });
  } catch (error: any) {
    console.error("GitHub video upload error:", error);
    
    return NextResponse.json(
      { 
        error: error.message || "Failed to upload video to GitHub",
        details: error.toString()
      },
      { status: 500 }
    );
  }
}

/**
 * Delete video from GitHub
 */
export async function DELETE(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get("path");

    if (!filePath) {
      return NextResponse.json(
        { error: "No file path provided" },
        { status: 400 }
      );
    }

    const success = await githubStorage.deleteVideo(filePath);

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Video deleted from GitHub",
      });
    } else {
      return NextResponse.json(
        { error: "Failed to delete video" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("GitHub video delete error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete video" },
      { status: 500 }
    );
  }
}

/**
 * List all videos in GitHub repository
 */
export async function GET() {
  try {
    await requireAdmin();

    const videos = await githubStorage.listVideos();

    return NextResponse.json({
      success: true,
      videos,
      count: videos.length,
    });
  } catch (error: any) {
    console.error("GitHub list videos error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to list videos" },
      { status: 500 }
    );
  }
}
