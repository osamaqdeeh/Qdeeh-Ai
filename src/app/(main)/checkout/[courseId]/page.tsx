import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Award } from "lucide-react";
import Image from "next/image";

interface CheckoutPageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin");
  }

  const { courseId } = await params;

  // Get course details
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      category: true,
      sections: {
        include: {
          lessons: true,
        },
      },
    },
  });

  if (!course || course.status !== "PUBLISHED") {
    notFound();
  }

  // Check if already enrolled
  const existingEnrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_courseId: {
        studentId: user.id,
        courseId: courseId,
      },
    },
  });

  if (existingEnrollment) {
    redirect(`/learn/${course.slug}`);
  }

  // Calculate course stats
  const totalLessons = course.sections.reduce(
    (acc, section) => acc + section.lessons.length,
    0
  );

  const totalDuration = course.sections.reduce(
    (acc, section) => {
      const sectionDuration = section.lessons.reduce(
        (total, lesson) => total + lesson.duration,
        0
      );
      return acc + sectionDuration;
    },
    0
  );

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Checkout</h1>
        <p className="text-muted-foreground">
          Complete your purchase to access this course
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Course Summary - Left Side */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>
                Review your order before completing payment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                {course.thumbnail && (
                  <div className="relative h-32 w-48 flex-shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{course.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {course.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {totalLessons} lessons
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(totalDuration)}
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      {course.level}
                    </Badge>
                  </div>
                  {course.instructorName && (
                    <p className="mt-3 text-sm">
                      Instructor: <span className="font-medium">{course.instructorName}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 border-t pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Course Price:</span>
                  <div className="flex items-center gap-2">
                    {course.discountPrice && course.discountPrice < course.price ? (
                      <>
                        <span className="text-muted-foreground line-through">
                          {formatPrice(course.price)}
                        </span>
                        <span className="font-semibold">
                          {formatPrice(course.discountPrice)}
                        </span>
                      </>
                    ) : (
                      <span className="font-semibold">{formatPrice(course.price)}</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Form - Right Side */}
        <div className="lg:col-span-1">
          <CheckoutForm
            courseId={course.id}
            courseTitle={course.title}
            basePrice={course.discountPrice || course.price}
            originalPrice={course.price}
          />
        </div>
      </div>
    </div>
  );
}
