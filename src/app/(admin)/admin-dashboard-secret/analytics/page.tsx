import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  Star,
  Video,
} from "lucide-react";

export default async function AdminAnalyticsPage() {
  await requireAdmin();

  // Get analytics data
  const [
    totalStudents,
    totalCourses,
    totalEnrollments,
    totalPayments,
    totalReviews,
    recentEnrollments,
    topCourses,
  ] = await Promise.all([
    prisma.student.count(),
    prisma.course.count(),
    prisma.enrollment.count(),
    prisma.payment.findMany({
      where: { status: "SUCCEEDED" },
      select: { amount: true },
    }),
    prisma.review.findMany({
      select: { rating: true },
    }),
    prisma.enrollment.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    }),
    prisma.course.findMany({
      select: {
        title: true,
        studentsCount: true,
        rating: true,
      },
      orderBy: { studentsCount: "desc" },
      take: 5,
    }),
  ]);

  const totalRevenue = totalPayments.reduce((sum, p) => sum + p.amount, 0);
  const averageRating =
    totalReviews.length > 0
      ? totalReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews.length
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Overview of platform performance and statistics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              {recentEnrollments.length} new enrollments this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              Active learning programs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(totalRevenue / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {totalPayments.length} successful payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrollments</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEnrollments}</div>
            <p className="text-xs text-muted-foreground">
              Total course enrollments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Rating
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Based on {totalReviews.length} reviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Course Completion
            </CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalEnrollments > 0
                ? (
                    (recentEnrollments.filter((e) => e.completedAt).length /
                      totalEnrollments) *
                    100
                  ).toFixed(1)
                : "0"}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              Overall completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Courses */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topCourses.map((course, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b pb-3 last:border-0"
              >
                <div className="flex-1">
                  <div className="font-medium">{course.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {course.studentsCount} students
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{course.rating.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
