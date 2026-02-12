import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, BookOpen, ShoppingCart } from "lucide-react";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { RecentActivity } from "@/components/admin/recent-activity";

// Revalidate every 2 minutes for admin dashboard
export const revalidate = 120;

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [
    totalRevenue,
    totalStudents,
    totalCourses,
    totalEnrollments,
    recentPayments,
  ] = await Promise.all([
    prisma.payment.aggregate({
      where: { status: "SUCCEEDED" },
      _sum: { amount: true },
    }),
    prisma.student.count(),
    prisma.course.count({ where: { status: "PUBLISHED" } }),
    prisma.enrollment.count(),
    prisma.payment.findMany({
      where: { status: "SUCCEEDED" },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  const revenue = totalRevenue._sum.amount || 0;

  // Calculate revenue by day for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Calculate revenue by day - currently unused but available for future charts
  // const dailyRevenue = await prisma.payment.groupBy({
  //   by: ["createdAt"],
  //   where: {
  //     status: "SUCCEEDED",
  //     createdAt: { gte: thirtyDaysAgo },
  //   },
  //   _sum: {
  //     amount: true,
  //   },
  // });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Overview of your platform&apos;s performance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${revenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCourses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEnrollments.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Activity */}
      <div className="grid gap-8 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={recentPayments} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivity payments={recentPayments.slice(0, 10)} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
