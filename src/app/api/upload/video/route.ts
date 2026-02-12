import { requireAdmin } from "@/lib/auth-helpers";
import { NextResponse } from "next/server";
import { cloudflareStream } from "@/lib/video/cloudflare-stream";
import { muxService } from "@/lib/video/mux";
import { githubStorage } from "@/lib/video/github-storage";

/**
 * Get upload URL for video upload
 * This endpoint returns a pre-signed URL for direct upload to video service
 * Supports: Cloudflare Stream, Mux, or GitHub (FREE!)
 */
export async function POST(request: Request) {
  try {
    await requireAdmin();

    // Get filename from request if provided
    const body = await request.json().catch(() => ({}));
    const fileName = body.fileName || `video_${Date.now()}.mp4`;

    // Choose video service based on environment variables
    const useGitHub = githubStorage.isConfigured();
    const useCloudflare = !!process.env.CLOUDFLARE_STREAM_API_TOKEN;
    const useMux = !!process.env.MUX_TOKEN_ID;

    // Priority: GitHub (free) > Cloudflare > Mux
    if (useGitHub) {
      const result = await githubStorage.prepareUpload(fileName);
      
      return NextResponse.json({
        uploadUrl: result.uploadUrl,
        videoId: result.fileName,
        path: result.path,
        provider: "github",
        message: "Upload video to GitHub - Free hosting!",
      });
    } else if (useCloudflare) {
      const result = await cloudflareStream.getUploadUrl();
      
      if (!result) {
        return NextResponse.json(
          { error: "Failed to get upload URL from Cloudflare Stream" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        uploadUrl: result.uploadUrl,
        videoId: result.videoId,
        provider: "cloudflare",
      });
    } else if (useMux) {
      const result = await muxService.createUpload();
      
      return NextResponse.json({
        uploadUrl: result.uploadUrl,
        uploadId: result.uploadId,
        provider: "mux",
      });
    } else {
      return NextResponse.json(
        { error: "No video service configured. Please set up GitHub (free), Cloudflare Stream, or Mux in your .env file." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Video upload URL error:", error);
    return NextResponse.json(
      { error: "Failed to get upload URL" },
      { status: 500 }
    );
  }
}
