import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { StripePaymentForm } from "@/components/checkout/stripe-payment-form";

interface PaymentPageProps {
  params: Promise<{
    courseId: string;
  }>;
  searchParams: Promise<{
    client_secret?: string;
  }>;
}

export default async function PaymentPage({ params, searchParams }: PaymentPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin");
  }

  const { courseId } = await params;
  const { client_secret } = await searchParams;

  if (!client_secret) {
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

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Complete Payment</h1>
        <p className="text-muted-foreground">
          Enter your card details to complete enrollment in {course.title}
        </p>
      </div>

      <StripePaymentForm
        clientSecret={client_secret}
        courseId={course.id}
        courseSlug={course.slug}
      />
    </div>
  );
}
