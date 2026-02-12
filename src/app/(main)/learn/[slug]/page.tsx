import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Clock, CheckCircle2, PlayCircle, FileText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

interface LearnPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function LearnPage({ params }: LearnPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin");
  }

  const { slug } = await params;

  // Get course with enrollment check
  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      category: true,
      sections: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            where: { isPublished: true },
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!course) {
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

  if (!enrollment) {
    // User is not enrolled, redirect to course page
    redirect(`/courses/${slug}`);
  }

  // Calculate progress
  const totalLessons = course.sections.reduce(
    (acc, section) => acc + section.lessons.length,
    0
  );

  const totalDuration = course.sections.reduce((acc, section) => {
    const sectionDuration = section.lessons.reduce(
      (total, lesson) => total + lesson.duration,
      0
    );
    return acc + sectionDuration;
  }, 0);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="container max-w-7xl py-8">
      {/* Course Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <p className="mt-2 text-muted-foreground">{course.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="secondary">{course.category.name}</Badge>
              <Badge variant="outline">{course.level}</Badge>
            </div>
          </div>
        </div>

        {/* Progress Card */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">Course Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(enrollment.progress)}% Complete
                  </span>
                </div>
                <Progress value={enrollment.progress} className="h-2" />
              </div>
              <div className="ml-6 flex gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span>{totalLessons} lessons</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDuration(totalDuration)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Content */}
      <Tabs defaultValue="content" className="space-y-4">
        <TabsList>
          <TabsTrigger value="content">Course Content</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          {course.sections.map((section, sectionIndex) => (
            <Card key={section.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {sectionIndex + 1}
                  </span>
                  {section.title}
                </CardTitle>
                {section.description && (
                  <CardDescription>{section.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {section.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          {lesson.videoUrl ? (
                            <PlayCircle className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <FileText className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">{lesson.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{lesson.videoUrl ? "VIDEO" : "TEXT"}</span>
                            {lesson.duration > 0 && (
                              <>
                                <span>•</span>
                                <span>{formatDuration(lesson.duration)}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {/* In a full implementation, track lesson completion */}
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/learn/${slug}/lesson/${lesson.id}`}>
                            Start
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>About This Course</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="mb-2 font-semibold">Description</h3>
                <p className="text-muted-foreground">{course.description}</p>
              </div>

              {course.instructorName && (
                <div>
                  <h3 className="mb-2 font-semibold">Instructor</h3>
                  <div className="flex items-center gap-3">
                    {course.instructorImage && (
                      <div className="h-12 w-12 overflow-hidden rounded-full bg-muted">
                        <img
                          src={course.instructorImage}
                          alt={course.instructorName}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{course.instructorName}</p>
                      {course.instructorBio && (
                        <p className="text-sm text-muted-foreground">
                          {course.instructorBio}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h3 className="mb-2 font-semibold">Course Stats</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-2 rounded-lg border p-3">
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Lessons</p>
                      <p className="font-semibold">{totalLessons}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border p-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-semibold">{formatDuration(totalDuration)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
