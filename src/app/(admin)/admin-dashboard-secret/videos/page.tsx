import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoUploader } from "@/components/admin/video-uploader";
import { Video, Upload, List } from "lucide-react";

// Revalidate every 2 minutes
export const revalidate = 120;

export default async function AdminVideosPage() {
  await requireAdmin();

  // Get all courses with their sections and lessons
  const courses = await prisma.course.findMany({
    select: {
      id: true,
      title: true,
      sections: {
        select: {
          id: true,
          title: true,
          lessons: {
            select: {
              id: true,
              title: true,
              videoUrl: true,
              duration: true,
              order: true,
            },
            orderBy: {
              order: "asc",
            },
          },
        },
        orderBy: {
          order: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Calculate video statistics
  const totalLessons = courses.reduce(
    (acc, course) =>
      acc + course.sections.reduce((sum, section) => sum + section.lessons.length, 0),
    0
  );
  
  const lessonsWithVideos = courses.reduce(
    (acc, course) =>
      acc +
      course.sections.reduce(
        (sum, section) => sum + section.lessons.filter((l) => l.videoUrl).length,
        0
      ),
    0
  );

  const totalDuration = courses.reduce(
    (acc, course) =>
      acc +
      course.sections.reduce(
        (sum, section) =>
          sum + section.lessons.reduce((d, lesson) => d + (lesson.duration || 0), 0),
        0
      ),
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Video Management</h1>
        <p className="text-muted-foreground">
          Upload and manage course videos
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lessons</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLessons}</div>
            <p className="text-xs text-muted-foreground">
              Across all courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lessons with Videos</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lessonsWithVideos}</div>
            <p className="text-xs text-muted-foreground">
              {totalLessons > 0 ? Math.round((lessonsWithVideos / totalLessons) * 100) : 0}% complete
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Duration</CardTitle>
            <List className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(totalDuration / 60)} hrs
            </div>
            <p className="text-xs text-muted-foreground">
              {totalDuration} minutes total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upload">
            <Upload className="mr-2 h-4 w-4" />
            Upload Videos
          </TabsTrigger>
          <TabsTrigger value="manage">
            <List className="mr-2 h-4 w-4" />
            Manage Videos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Course Videos</CardTitle>
              <CardDescription>
                Upload videos to Cloudflare Stream or Mux. Videos are automatically optimized for fast delivery.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VideoUploader courses={courses} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Course Videos</CardTitle>
              <CardDescription>
                View and manage all uploaded videos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {courses.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No courses found. Create a course first.
                  </p>
                ) : (
                  courses.map((course) => (
                    <div key={course.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold text-lg mb-3">{course.title}</h3>
                      {course.sections.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No sections in this course yet.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {course.sections.map((section) => (
                            <div key={section.id} className="pl-4 border-l-2">
                              <h4 className="font-medium mb-2">{section.title}</h4>
                              {section.lessons.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                  No lessons in this section yet.
                                </p>
                              ) : (
                                <ul className="space-y-2">
                                  {section.lessons.map((lesson) => (
                                    <li
                                      key={lesson.id}
                                      className="flex items-center justify-between text-sm p-2 rounded hover:bg-muted"
                                    >
                                      <div className="flex items-center gap-2">
                                        <Video className="h-4 w-4" />
                                        <span>{lesson.title}</span>
                                      </div>
                                      <div className="flex items-center gap-4 text-muted-foreground">
                                        {lesson.duration && (
                                          <span>{lesson.duration} min</span>
                                        )}
                                        {lesson.videoUrl ? (
                                          <span className="text-green-600 font-medium">✓ Uploaded</span>
                                        ) : (
                                          <span className="text-amber-600 font-medium">⚠ Missing</span>
                                        )}
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
