import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default async function RevenuePage() {
  await requireAdmin();

  // Get all successful payments
  const payments = await prisma.payment.findMany({
    where: {
      status: "SUCCEEDED",
    },
    include: {
      student: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Calculate total revenue
  const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);

  // Get revenue from activity logs
  const revenueActivities = await prisma.adminActivityLog.findMany({
    where: {
      action: "REVENUE_RECEIVED",
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Revenue Dashboard</h1>
        <p className="text-muted-foreground">
          Track all payments and revenue from course enrollments
        </p>
      </div>

      {/* Revenue Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatPrice(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              From {payments.length} successful payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Average Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {payments.length > 0 ? formatPrice(totalRevenue / payments.length) : "$0.00"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Per enrollment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Revenue Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{revenueActivities.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tracked revenue events
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>
            Latest successful payments from students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No payments yet
              </p>
            ) : (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{payment.student.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {payment.student.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(payment.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        {formatPrice(payment.amount)}
                      </p>
                      {payment.discountAmount && payment.discountAmount > 0 && (
                        <p className="text-xs text-green-600">
                          Saved {formatPrice(payment.discountAmount)}
                        </p>
                      )}
                      {payment.metadata && typeof payment.metadata === 'object' && 'paymentMethod' in payment.metadata && (
                        <p className="text-xs text-muted-foreground">
                          {payment.metadata.paymentMethod === 'fake_card' ? '💳 Card' : 'Payment'}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
