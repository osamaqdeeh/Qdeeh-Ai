import { prisma } from "@/lib/prisma";
import { EnrollmentsTable } from "@/components/admin/enrollments-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default async function EnrollmentsPage() {
  const enrollments = await prisma.enrollment.findMany({
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          price: true,
          discountPrice: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Get payment info for each enrollment
  const enrollmentsWithPayments = await Promise.all(
    enrollments.map(async (enrollment) => {
      const payment = await prisma.payment.findFirst({
        where: {
          studentId: enrollment.studentId,
          courseId: enrollment.courseId,
        },
      });

      let coupon = null;
      if (payment?.couponId) {
        coupon = await prisma.coupon.findUnique({
          where: { id: payment.couponId },
        });
      }

      return {
        ...enrollment,
        payment: payment ? { ...payment, coupon } : null,
      };
    })
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Enrollment Management</h1>
        <p className="text-muted-foreground">
          Manage student enrollments, coupons, and access
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrollments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Free Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {enrollmentsWithPayments.filter((e) => e.payment?.amount === 0).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Paid Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {enrollmentsWithPayments.filter((e) => e.payment && e.payment.amount > 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Enrollments</CardTitle>
          <CardDescription>
            View and manage student enrollments and coupon usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EnrollmentsTable enrollments={enrollmentsWithPayments} />
        </CardContent>
      </Card>
    </div>
  );
}
