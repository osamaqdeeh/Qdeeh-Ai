import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { PaymentCredentialsRegister } from "@/components/checkout/payment-credentials-register";
import { PaymentCredentialsValidate } from "@/components/checkout/payment-credentials-validate";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

interface PaymentPageProps {
  params: Promise<{
    courseId: string;
  }>;
  searchParams: Promise<{
    amount?: string;
    coupon?: string;
  }>;
}

export default async function PaymentPage({ params, searchParams }: PaymentPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin");
  }

  const { courseId } = await params;
  const { amount, coupon } = await searchParams;

  if (!amount) {
    redirect(`/checkout/${courseId}`);
  }

  // Get course details
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      title: true,
      slug: true,
    },
  });

  if (!course) {
    notFound();
  }

  const paymentAmount = parseFloat(amount);

  // Check if user has saved payment credentials
  const hasCredentials = await prisma.paymentCredentials.findUnique({
    where: { studentId: user.id },
  });

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          {hasCredentials ? "Complete Payment" : "Register Payment Information"}
        </h1>
        <p className="text-muted-foreground">
          {hasCredentials
            ? `Enter your registered card details to complete enrollment in ${course.title}`
            : `First, save your card details to our database for ${course.title}`
          }
        </p>
      </div>

      {hasCredentials ? (
        <PaymentCredentialsValidate
          courseId={course.id}
          courseSlug={course.slug}
          amount={paymentAmount}
          couponCode={coupon}
        />
      ) : (
        <PaymentCredentialsRegister
          courseId={course.id}
          amount={paymentAmount}
          couponCode={coupon}
        />
      )}
    </div>
  );
}
