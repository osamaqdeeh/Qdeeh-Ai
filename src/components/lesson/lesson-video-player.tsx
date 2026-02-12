"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { VideoPlayer } from "@/components/video-player";
import { AlertCircle } from "lucide-react";

interface LessonVideoPlayerProps {
  videoUrl: string;
  lessonId: string;
  initialPosition?: number;
}

export function LessonVideoPlayer({
  videoUrl,
  lessonId,
  initialPosition = 0,
}: LessonVideoPlayerProps) {
  const [lastSavedTime, setLastSavedTime] = useState(0);
  const [videoError, setVideoError] = useState(false);

  // Check if video URL is valid
  const isValidVideoUrl = (url: string) => {
    if (!url || url.trim() === '') return false;
    
    // Check if it's a valid URL format
    try {
      const urlObj = new URL(url);
      
      // Allow http/https protocols
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return false;
      }
      
      // Check if it has a video extension or is a streaming/GitHub URL
      const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.m3u8', '.mkv', '.avi'];
      const hasVideoExtension = videoExtensions.some(ext => url.toLowerCase().includes(ext));
      
      // Check for streaming services or GitHub raw URLs
      const isGitHubRaw = url.includes('raw.githubusercontent.com');
      const isStreamingUrl = url.includes('stream') || url.includes('video') || url.includes('cloudflare') || url.includes('mux') || url.includes('iframe');
      
      return hasVideoExtension || isStreamingUrl || isGitHubRaw;
    } catch {
      return false;
    }
  };

  const handleProgress = async (currentTime: number, duration: number) => {
    // Save progress every 5 seconds to avoid too many requests
    if (Math.abs(currentTime - lastSavedTime) >= 5) {
      setLastSavedTime(currentTime);
      
      // TODO: Call API to save progress
      // await fetch(`/api/lessons/${lessonId}/progress`, {
      //   method: 'POST',
      //   body: JSON.stringify({ currentTime, duration }),
      // });
      
      console.log('Progress saved:', { lessonId, currentTime, duration });
    }
  };

  const handleComplete = async () => {
    // TODO: Call API to mark lesson as completed
    // await fetch(`/api/lessons/${lessonId}/complete`, {
    //   method: 'POST',
    // });
    
    console.log('Lesson completed:', lessonId);
  };

  // Show error state if video URL is invalid or video fails to load
  if (!isValidVideoUrl(videoUrl) || videoError) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
          <div className="rounded-full bg-yellow-100 p-3 dark:bg-yellow-900/20">
            <AlertCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold">Video Not Available</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              The video for this lesson hasn&apos;t been uploaded yet or is being processed.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Please check back later or contact support if this issue persists.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div onError={() => setVideoError(true)}>
          <VideoPlayer
            videoUrl={videoUrl}
            initialTime={initialPosition}
            onProgress={handleProgress}
            onComplete={handleComplete}
          />
        </div>
      </CardContent>
    </Card>
  );
}
