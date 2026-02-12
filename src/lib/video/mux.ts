/**
 * Mux Video Integration
 * Documentation: https://docs.mux.com/
 */

import Mux from "@mux/mux-node";

let mux: Mux | null = null;

if (process.env.MUX_TOKEN_ID && process.env.MUX_TOKEN_SECRET) {
  mux = new Mux({
    tokenId: process.env.MUX_TOKEN_ID,
    tokenSecret: process.env.MUX_TOKEN_SECRET,
  });
}

export class MuxService {
  /**
   * Create an upload URL for direct upload
   */
  async createUpload() {
    if (!mux) {
      throw new Error("Mux not configured");
    }

    try {
      // Get dynamic CORS origin
      const corsOrigin = this.getCorsOrigin();
      
      const upload = await mux.video.uploads.create({
        cors_origin: corsOrigin,
        new_asset_settings: {
          playback_policy: ["signed"], // Require signed URLs for playback
        },
      });

      return {
        uploadUrl: upload.url,
        uploadId: upload.id,
      };
    } catch (error) {
      console.error("Mux create upload error:", error);
      throw error;
    }
  }

  /**
   * Create asset from URL
   */
  async createAssetFromUrl(url: string) {
    if (!mux) {
      throw new Error("Mux not configured");
    }

    try {
      const asset = await mux.video.assets.create({
        input: [{ url }],
        playback_policy: ["signed"],
      });

      return asset.id;
    } catch (error) {
      console.error("Mux create asset error:", error);
      throw error;
    }
  }

  /**
   * Get upload status
   */
  async getUploadStatus(uploadId: string) {
    if (!mux) {
      throw new Error("Mux not configured");
    }

    try {
      const upload = await mux.video.uploads.retrieve(uploadId);
      return upload;
    } catch (error) {
      console.error("Mux get upload error:", error);
      throw error;
    }
  }

  /**
   * Get asset details
   */
  async getAsset(assetId: string) {
    if (!mux) {
      throw new Error("Mux not configured");
    }

    try {
      const asset = await mux.video.assets.retrieve(assetId);
      return asset;
    } catch (error) {
      console.error("Mux get asset error:", error);
      throw error;
    }
  }

  /**
   * Delete asset
   */
  async deleteAsset(assetId: string) {
    if (!mux) {
      throw new Error("Mux not configured");
    }

    try {
      await mux.video.assets.delete(assetId);
      return true;
    } catch (error) {
      console.error("Mux delete asset error:", error);
      return false;
    }
  }

  /**
   * Generate signed playback URL
   */
  async getSignedPlaybackUrl(playbackId: string, expiresIn: number = 3600) {
    if (!mux) {
      throw new Error("Mux not configured");
    }

    try {
      const token = mux.jwt.signPlaybackId(playbackId, {
        type: "video",
        expiration: `${expiresIn}s`,
      });

      return `https://stream.mux.com/${playbackId}.m3u8?token=${token}`;
    } catch (error) {
      console.error("Mux signed URL error:", error);
      throw error;
    }
  }

  /**
   * Get thumbnail URL
   */
  getThumbnailUrl(playbackId: string, options?: { width?: number; time?: number }) {
    const params = new URLSearchParams();
    if (options?.width) params.append("width", options.width.toString());
    if (options?.time) params.append("time", options.time.toString());

    return `https://image.mux.com/${playbackId}/thumbnail.jpg?${params.toString()}`;
  }

  /**
   * Get dynamic CORS origin for both localhost and production
   */
  private getCorsOrigin(): string {
    // Priority: NEXT_PUBLIC_APP_URL > VERCEL_URL > localhost
    if (process.env.NEXT_PUBLIC_APP_URL) {
      return process.env.NEXT_PUBLIC_APP_URL;
    }
    
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
    
    // Allow all origins as fallback (less secure but works)
    return "*";
  }
}

export const muxService = new MuxService();
