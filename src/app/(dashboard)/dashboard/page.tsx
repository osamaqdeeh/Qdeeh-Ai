import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BookOpen, Award, Clock, TrendingUp } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatDuration } from "@/lib/utils";

// Ensure fresh enrollment data after payment
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default async function DashboardPage() {
  const user = await getCurrentUser();

  const [enrollments, certificates] = await Promise.all([
    prisma.enrollment.findMany({
      where: { studentId: user.id },
      include: {
        course: {
          include: {
            category: true,
            sections: {
              include: {
                lessons: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.certificate.findMany({
      where: { studentId: user.id },
      orderBy: { issuedAt: "desc" },
    }),
  ]);

  const inProgressCourses = enrollments.filter(
    (e) => e.progress > 0 && e.progress < 100
  );
  const completedCourses = enrollments.filter((e) => e.progress === 100);

  const totalLearningTime = enrollments.reduce((total, enrollment) => {
    const courseDuration = enrollment.course.sections.reduce(
      (sum, section) =>
        sum + section.lessons.reduce((lessonSum, lesson) => lessonSum + lesson.duration, 0),
      0
    );
    return total + (courseDuration * enrollment.progress) / 100;
  }, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Learning Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, {user.name}! Continue your learning journey.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrollments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressCourses.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCourses.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(totalLearningTime)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Continue Learning */}
      {inProgressCourses.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Continue Learning</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {inProgressCourses.map((enrollment) => (
              <Card key={enrollment.id} className="overflow-hidden">
                <div className="relative h-40 w-full">
                  {enrollment.course.thumbnail ? (
                    <Image
                      src={enrollment.course.thumbnail}
                      alt={enrollment.course.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full bg-muted flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2">
                    {enrollment.course.title}
                  </h3>
                  <div className="space-y-2">
                    <Progress value={enrollment.progress} />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {Math.round(enrollment.progress)}% complete
                      </span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" asChild>
                    <Link href={`/learn/${enrollment.course.slug}`}>Continue</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Courses */}
      <div>
        <h2 className="text-2xl font-bold mb-4">All My Courses</h2>
        {enrollments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
              <p className="text-muted-foreground mb-4">
                Start your learning journey by enrolling in a course
              </p>
              <Button asChild>
                <Link href="/courses">Browse Courses</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {enrollments.map((enrollment) => (
              <Card key={enrollment.id} className="overflow-hidden">
                <div className="relative h-40 w-full">
                  {enrollment.course.thumbnail ? (
                    <Image
                      src={enrollment.course.thumbnail}
                      alt={enrollment.course.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full bg-muted flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2">
                    {enrollment.course.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {enrollment.course.category.name}
                  </p>
                  <div className="space-y-2">
                    <Progress value={enrollment.progress} />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {Math.round(enrollment.progress)}% complete
                      </span>
                      {enrollment.progress === 100 && (
                        <Award className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="outline" asChild>
                    <Link href={`/learn/${enrollment.course.slug}`}>
                      {enrollment.progress === 100 ? "Review" : "Continue"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Certificates */}
      {certificates.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">My Certificates</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {certificates.map((certificate) => (
              <Card key={certificate.id}>
                <CardContent className="p-6">
                  <Award className="h-12 w-12 text-yellow-500 mb-4" />
                  <p className="font-semibold mb-1">Certificate of Completion</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    {certificate.certificateNumber}
                  </p>
                  <Button variant="outline" size="sm">
                    Download
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
