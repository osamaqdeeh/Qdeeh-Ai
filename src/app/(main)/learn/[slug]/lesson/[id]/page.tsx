import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LessonVideoPlayer } from "@/components/lesson/lesson-video-player";
import { ChevronLeft, ChevronRight, CheckCircle2, FileText, Download } from "lucide-react";
import Link from "next/link";

interface LessonPageProps {
  params: Promise<{
    slug: string;
    id: string;
  }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin");
  }

  const { slug, id } = await params;

  // Get lesson with course and section info
  const lesson = await prisma.lesson.findUnique({
    where: { 
      id,
      isPublished: true,
    },
    include: {
      section: {
        include: {
          course: {
            include: {
              sections: {
                orderBy: { order: "asc" },
                include: {
                  lessons: {
                    orderBy: { order: "asc" },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!lesson) {
    notFound();
  }

  const course = lesson.section.course;

  // Verify slug matches
  if (course.slug !== slug) {
    notFound();
  }

  // Check enrollment
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_courseId: {
        studentId: user.id,
        courseId: course.id,
      },
    },
  });

  // Check if lesson is free or user is enrolled
  if (!lesson.isFree && !enrollment) {
    redirect(`/courses/${slug}`);
  }

  // Get all lessons in order for navigation
  const allLessons = course.sections.flatMap((section) =>
    section.lessons.map((l) => ({
      id: l.id,
      title: l.title,
      sectionTitle: section.title,
    }))
  );

  const currentIndex = allLessons.findIndex((l) => l.id === id);
  const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  // Get lesson progress if enrolled
  let lessonProgress = null;
  if (enrollment) {
    lessonProgress = await prisma.lessonProgress.findUnique({
      where: {
        studentId_lessonId: {
          studentId: user.id,
          lessonId: id,
        },
      },
    });
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Parse attachments if they exist
  let attachments: Array<{ name: string; url: string; size?: number }> = [];
  if (lesson.attachments && Array.isArray(lesson.attachments)) {
    attachments = lesson.attachments as Array<{ name: string; url: string; size?: number }>;
  }

  return (
    <div className="container max-w-7xl py-6">
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href={`/learn/${slug}`} className="hover:text-foreground">
          {course.title}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{lesson.title}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Player */}
          {lesson.videoUrl && (
            <LessonVideoPlayer
              videoUrl={lesson.videoUrl}
              lessonId={lesson.id}
              initialPosition={lessonProgress?.lastPosition || 0}
            />
          )}

          {/* Lesson Info */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl">{lesson.title}</CardTitle>
                  {lesson.description && (
                    <CardDescription className="mt-2 text-base">
                      {lesson.description}
                    </CardDescription>
                  )}
                </div>
                {lessonProgress?.completed && (
                  <div className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
                    <CheckCircle2 className="h-4 w-4" />
                    Completed
                  </div>
                )}
              </div>
              <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                <span>{lesson.section.title}</span>
                {lesson.duration > 0 && (
                  <>
                    <span>•</span>
                    <span>{formatDuration(lesson.duration)}</span>
                  </>
                )}
              </div>
            </CardHeader>
          </Card>

          {/* Lesson Content Tabs */}
          <Tabs defaultValue="content" className="space-y-4">
            <TabsList>
              <TabsTrigger value="content">Content</TabsTrigger>
              {attachments.length > 0 && (
                <TabsTrigger value="resources">Resources</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="content">
              <Card>
                <CardContent className="prose prose-sm dark:prose-invert max-w-none pt-6">
                  {lesson.content ? (
                    <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
                  ) : (
                    <p className="text-muted-foreground">
                      No additional content available for this lesson.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {attachments.length > 0 && (
              <TabsContent value="resources">
                <Card>
                  <CardHeader>
                    <CardTitle>Downloadable Resources</CardTitle>
                    <CardDescription>
                      Additional materials for this lesson
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {attachments.map((attachment: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{attachment.name}</p>
                            {attachment.size && (
                              <p className="text-sm text-muted-foreground">
                                {(attachment.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            )}
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={attachment.url} download target="_blank" rel="noopener noreferrer">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </a>
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            {previousLesson ? (
              <Button variant="outline" asChild>
                <Link href={`/learn/${slug}/lesson/${previousLesson.id}`}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous Lesson
                </Link>
              </Button>
            ) : (
              <div />
            )}
            {nextLesson ? (
              <Button asChild>
                <Link href={`/learn/${slug}/lesson/${nextLesson.id}`}>
                  Next Lesson
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href={`/learn/${slug}`}>
                  Back to Course
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Sidebar - Course Content */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">Course Content</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[600px] space-y-4 overflow-y-auto">
              {course.sections.map((section) => (
                <div key={section.id}>
                  <h3 className="mb-2 font-semibold">{section.title}</h3>
                  <div className="space-y-1">
                    {section.lessons.map((l) => (
                      <Link
                        key={l.id}
                        href={`/learn/${slug}/lesson/${l.id}`}
                        className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                          l.id === id
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="flex-1 truncate">{l.title}</span>
                          {enrollment && (
                            <CheckCircle2 className="ml-2 h-4 w-4 flex-shrink-0 text-green-500" />
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
