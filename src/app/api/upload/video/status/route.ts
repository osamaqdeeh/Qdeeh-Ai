import { requireAdmin } from "@/lib/auth-helpers";
import { NextResponse } from "next/server";
import { muxService } from "@/lib/video/mux";

/**
 * Check video upload/processing status
 * Used for polling Mux asset readiness
 */
export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const uploadId = searchParams.get("uploadId");

    if (!uploadId) {
      return NextResponse.json(
        { error: "Upload ID is required" },
        { status: 400 }
      );
    }

    // Check if Mux is configured
    if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
      return NextResponse.json(
        { error: "Mux not configured" },
        { status: 500 }
      );
    }

    try {
      // Get upload status from Mux
      const upload = await muxService.getUploadStatus(uploadId);

      if (upload.status === "asset_created" && upload.asset_id) {
        // Check if asset is ready
        const asset = await muxService.getAsset(upload.asset_id);
        
        if (asset.status === "ready") {
          return NextResponse.json({
            status: "ready",
            assetId: upload.asset_id,
            playbackId: asset.playback_ids?.[0]?.id,
          });
        } else if (asset.status === "errored") {
          return NextResponse.json({
            status: "error",
            error: "Asset processing failed",
          });
        } else {
          return NextResponse.json({
            status: "processing",
            progress: asset.status,
          });
        }
      } else if (upload.status === "errored") {
        return NextResponse.json({
          status: "error",
          error: upload.error?.message || "Upload failed",
        });
      } else {
        return NextResponse.json({
          status: "uploading",
          progress: upload.status,
        });
      }
    } catch (error: any) {
      console.error("Status check error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to check status" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Video status error:", error);
    return NextResponse.json(
      { error: "Failed to check upload status" },
      { status: 500 }
    );
  }
}
