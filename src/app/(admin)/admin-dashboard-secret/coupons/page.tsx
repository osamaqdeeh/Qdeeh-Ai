import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CouponsTable } from "@/components/admin/coupons-table";
import { CreateCouponDialog } from "@/components/admin/create-coupon-dialog";

export default async function CouponsPage() {
  await requireAdmin();

  const [coupons, courses] = await Promise.all([
    prisma.coupon.findMany({
      include: {
        courses: {
          include: {
            course: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.course.findMany({
      where: { status: "PUBLISHED" },
      select: {
        id: true,
        title: true,
      },
      orderBy: { title: "asc" },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Coupon Management</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage discount coupons for your courses
          </p>
        </div>
        <CreateCouponDialog courses={courses} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Coupons</CardTitle>
          <CardDescription>
            Manage your promotional codes and discounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CouponsTable coupons={coupons} />
        </CardContent>
      </Card>
    </div>
  );
}
