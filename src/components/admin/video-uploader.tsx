"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Upload, CheckCircle, AlertCircle, Loader2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";

interface Course {
  id: string;
  title: string;
  sections: {
    id: string;
    title: string;
    lessons: {
      id: string;
      title: string;
      videoUrl: string | null;
    }[];
  }[];
}

interface VideoUploaderProps {
  courses: Course[];
  onUploadComplete?: (videoId: string, videoUrl: string) => void;
  onError?: (error: string) => void;
}

export function VideoUploader({ courses, onUploadComplete, onError }: VideoUploaderProps) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedLesson, setSelectedLesson] = useState<string>("");
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [creatingLesson, setCreatingLesson] = useState(false);
  
  const selectedCourseData = courses.find((c) => c.id === selectedCourse);
  const selectedSectionData = selectedCourseData?.sections.find((s) => s.id === selectedSection);
  const availableLessons = selectedSectionData?.lessons || [];

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate selection
    if (!selectedCourse || !selectedSection || !selectedLesson) {
      toast({
        title: "Selection required",
        description: "Please select a course, section, and lesson first.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      setStatus("uploading");
      setProgress(0);

      // Get upload URL from API with lesson info
      const response = await fetch("/api/upload/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: selectedLesson,
          fileName: file.name,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get upload URL");
      }

      const { uploadUrl, videoId, uploadId, provider } = await response.json();

      // Different upload methods for different providers
      if (provider === "github") {
        // GitHub uses FormData upload to our API
        const formData = new FormData();
        formData.append("file", file);
        formData.append("fileName", file.name);
        formData.append("lessonId", selectedLesson);

        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            setProgress(percentComplete);
          }
        });

        xhr.addEventListener("load", async () => {
          if (xhr.status === 200) {
            try {
              setStatus("processing");
              setProgress(100);

              const result = JSON.parse(xhr.responseText);
              
              // Update lesson with video URL and publish it
              const updateResponse = await fetch(`/api/lessons/${selectedLesson}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  videoUrl: result.videoUrl,
                  isPublished: true,
                }),
              });

              if (!updateResponse.ok) {
                throw new Error("Failed to update lesson with video URL");
              }

              onUploadComplete?.(videoId, result.videoUrl);
              setStatus("success");

              toast({
                title: "Video uploaded to GitHub! 🎉",
                description: "Your video is now hosted for FREE on GitHub!",
              });

              router.refresh();

              setTimeout(() => {
                setUploading(false);
                setStatus("idle");
                setProgress(0);
                setSelectedLesson("");
              }, 2000);
            } catch (error) {
              const message = error instanceof Error ? error.message : "Upload processing failed";
              setErrorMessage(message);
              setStatus("error");
              setUploading(false);
              onError?.(message);

              toast({
                title: "Upload processing failed",
                description: message,
                variant: "destructive",
              });
            }
          } else {
            const message = `Upload failed with status: ${xhr.status}`;
            setErrorMessage(message);
            setStatus("error");
            setUploading(false);
            onError?.(message);

            toast({
              title: "Upload failed",
              description: message,
              variant: "destructive",
            });
          }
        });

        xhr.addEventListener("error", () => {
          const message = "Network error during upload";
          setErrorMessage(message);
          setStatus("error");
          setUploading(false);
          onError?.(message);

          toast({
            title: "Upload failed",
            description: message,
            variant: "destructive",
          });
        });

        xhr.open("POST", "/api/upload/video/github");
        xhr.send(formData);
      } else {
        // Cloudflare/Mux use direct PUT upload
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            setProgress(percentComplete);
          }
        });

        xhr.addEventListener("load", async () => {
          if (xhr.status === 200) {
            try {
              setStatus("processing");
              setProgress(100);

              // For Cloudflare Stream, video is immediately available
              // For Mux, we need to wait for processing
              if (provider === "cloudflare") {
                // Construct video URL - Cloudflare Stream embed URL
                // The videoId is already set from the upload preparation
                const videoUrl = `https://iframe.cloudflarestream.com/${videoId}`;
                
                // Update lesson with video URL, videoId and publish it
                const updateResponse = await fetch(`/api/lessons/${selectedLesson}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    videoUrl,
                    videoId,
                    isPublished: true,
                  }),
                });

                if (!updateResponse.ok) {
                  throw new Error("Failed to update lesson with video URL");
                }

                toast({
                  title: "Video uploaded successfully!",
                  description: "The video is now available for students.",
                });

                router.refresh();
                onUploadComplete?.(videoId, videoUrl);
                setStatus("success");
              } else if (provider === "mux") {
                // Poll for asset readiness
                const assetId = await pollMuxAsset(uploadId);
                if (assetId) {
                  // Update lesson with Mux asset ID and publish it
                  const videoUrl = `https://stream.mux.com/${assetId}.m3u8`;
                  const updateResponse = await fetch(`/api/lessons/${selectedLesson}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      videoUrl,
                      videoId: assetId,
                      isPublished: true,
                    }),
                  });

                  if (!updateResponse.ok) {
                    throw new Error("Failed to update lesson with video URL");
                  }

                  onUploadComplete?.(assetId, videoUrl);
                  setStatus("success");
                } else {
                  throw new Error("Video processing timeout");
                }
              }

              toast({
                title: "Video uploaded successfully!",
                description: "The video has been uploaded and is ready to use.",
              });

              // Refresh the page to show updated data
              router.refresh();

              setTimeout(() => {
                setUploading(false);
                setStatus("idle");
                setProgress(0);
                setSelectedLesson("");
              }, 2000);
            } catch (error) {
              const message = error instanceof Error ? error.message : "Upload processing failed";
              setErrorMessage(message);
              setStatus("error");
              setUploading(false);
              onError?.(message);

              toast({
                title: "Upload processing failed",
                description: message,
                variant: "destructive",
              });
            }
          } else {
            const message = `Upload failed with status: ${xhr.status}`;
            setErrorMessage(message);
            setStatus("error");
            setUploading(false);
            onError?.(message);

            toast({
              title: "Upload failed",
              description: message,
              variant: "destructive",
            });
          }
        });

        xhr.addEventListener("error", () => {
          const message = "Network error during upload";
          setErrorMessage(message);
          setStatus("error");
          setUploading(false);
          onError?.(message);

          toast({
            title: "Upload failed",
            description: message,
            variant: "destructive",
          });
        });

        xhr.open("PUT", uploadUrl);
        xhr.send(file);
      }
    } catch (error) {
      console.error("Upload error:", error);
      const message = error instanceof Error ? error.message : "Upload failed";
      setErrorMessage(message);
      setStatus("error");
      setUploading(false);
      onError?.(message);

      toast({
        title: "Upload failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  const pollMuxAsset = async (uploadId: string, maxAttempts = 30): Promise<string | null> => {
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds

      try {
        const response = await fetch(`/api/upload/video/status?uploadId=${uploadId}`);
        const data = await response.json();

        if (data.status === "ready") {
          return data.assetId;
        } else if (data.status === "error") {
          throw new Error("Video processing failed");
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }

    return null;
  };

  const handleCreateLesson = async () => {
    if (!selectedSection || !newLessonTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a lesson title",
        variant: "destructive",
      });
      return;
    }

    setCreatingLesson(true);
    try {
      const response = await fetch("/api/lessons/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionId: selectedSection,
          title: newLessonTitle,
          order: availableLessons.length,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create lesson");
      }

      toast({
        title: "Success",
        description: "Lesson created successfully!",
      });

      setNewLessonTitle("");
      setShowLessonForm(false);
      router.refresh();
    } catch {
      toast({
        title: "Error",
        description: "Failed to create lesson",
        variant: "destructive",
      });
    } finally {
      setCreatingLesson(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".mov", ".avi", ".webm"],
    },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024, // 100MB for GitHub, 5GB for others (GitHub limit)
    disabled: uploading,
  });

  return (
    <div className="space-y-6">
      {/* Selection dropdowns */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>Select Course</Label>
          <Select
            value={selectedCourse}
            onValueChange={(value) => {
              setSelectedCourse(value);
              setSelectedSection("");
              setSelectedLesson("");
            }}
            disabled={uploading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Select Section</Label>
          <Select
            value={selectedSection}
            onValueChange={(value) => {
              setSelectedSection(value);
              setSelectedLesson("");
            }}
            disabled={!selectedCourse || uploading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a section" />
            </SelectTrigger>
            <SelectContent>
              {selectedCourseData?.sections.map((section) => (
                <SelectItem key={section.id} value={section.id}>
                  {section.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Select Lesson</Label>
          <Select
            value={selectedLesson}
            onValueChange={setSelectedLesson}
            disabled={!selectedSection || uploading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a lesson" />
            </SelectTrigger>
            <SelectContent>
              {availableLessons.length > 0 ? (
                availableLessons.map((lesson) => (
                  <SelectItem key={lesson.id} value={lesson.id}>
                    {lesson.title} {lesson.videoUrl && "✓"}
                  </SelectItem>
                ))
              ) : (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  No lessons yet
                </div>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Create lesson section */}
      {selectedSection && availableLessons.length === 0 && !showLessonForm && (
        <div className="bg-muted/50 border border-dashed rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-3">
            No lessons found in this section. Create a lesson first to upload videos.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowLessonForm(true)}
            disabled={uploading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Lesson
          </Button>
        </div>
      )}

      {selectedSection && showLessonForm && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lesson-title">Lesson Title</Label>
                <Input
                  id="lesson-title"
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                  placeholder="Enter lesson title"
                  disabled={creatingLesson}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleCreateLesson}
                  disabled={creatingLesson || !newLessonTitle.trim()}
                  size="sm"
                >
                  {creatingLesson && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {creatingLesson ? "Creating..." : "Create Lesson"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowLessonForm(false);
                    setNewLessonTitle("");
                  }}
                  disabled={creatingLesson}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedSection && availableLessons.length > 0 && !selectedLesson && (
        <div className="bg-muted/50 border border-dashed rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-3">
            Select a lesson from the dropdown above, or create a new one.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowLessonForm(!showLessonForm)}
            disabled={uploading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Another Lesson
          </Button>
        </div>
      )}

      {/* Upload area */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors",
              isDragActive && "border-primary bg-primary/5",
              uploading && "opacity-50 cursor-not-allowed",
              status === "error" && "border-destructive",
              !selectedLesson && !uploading && "opacity-50"
            )}
          >
            <input {...getInputProps()} />

          {status === "idle" && (
            <>
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              {selectedLesson ? (
                <>
                  <p className="text-lg font-medium mb-2">
                    {isDragActive ? "Drop video here" : "Drag & drop video here"}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    or click to browse files
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports: MP4, MOV, AVI, WebM (max 100MB for GitHub, 5GB for Cloudflare/Mux)
                  </p>
                </>
              ) : (
                <>
                  <p className="text-lg font-medium mb-2">
                    Select a lesson first
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Choose a course, section, and lesson from the dropdowns above
                  </p>
                </>
              )}
            </>
          )}

          {status === "uploading" && (
            <>
              <Loader2 className="mx-auto h-12 w-12 text-primary mb-4 animate-spin" />
              <p className="text-lg font-medium mb-4">Uploading video...</p>
              <Progress value={progress} className="mb-2" />
              <p className="text-sm text-muted-foreground">{Math.round(progress)}%</p>
            </>
          )}

          {status === "processing" && (
            <>
              <Loader2 className="mx-auto h-12 w-12 text-primary mb-4 animate-spin" />
              <p className="text-lg font-medium mb-2">Processing video...</p>
              <p className="text-sm text-muted-foreground">
                This may take a few minutes. Optimizing for fast delivery.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <p className="text-lg font-medium text-green-500">Upload successful!</p>
            </>
          )}

          {status === "error" && (
            <>
              <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
              <p className="text-lg font-medium text-destructive mb-2">Upload failed</p>
              <p className="text-sm text-muted-foreground">{errorMessage}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={(e) => {
                  e.stopPropagation();
                  setStatus("idle");
                  setErrorMessage("");
                }}
              >
                Try Again
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
    </div>
  );
}
