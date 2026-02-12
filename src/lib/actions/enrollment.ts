"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";

export async function createFreeEnrollment(courseId: string, couponCode?: string) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return { error: "You must be signed in to enroll" };
    }

    // Get course
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return { error: "Course not found" };
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: user.id,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      return { error: "Already enrolled in this course" };
    }

    let couponId: string | undefined;

    // If coupon was used, update its usage
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });

      if (coupon) {
        couponId = coupon.id;
        // Update coupon usage
        await prisma.coupon.update({
          where: { id: coupon.id },
          data: {
            currentUses: {
              increment: 1,
            },
          },
        });
      }
    }

    // Create enrollment
    await prisma.enrollment.create({
      data: {
        studentId: user.id,
        courseId,
      },
    });

    // Update course student count
    await prisma.course.update({
      where: { id: courseId },
      data: {
        studentsCount: {
          increment: 1,
        },
      },
    });

    // Create a payment record for tracking (even though it's free)
    await prisma.payment.create({
      data: {
        studentId: user.id,
        courseId,
        amount: 0,
        status: "SUCCEEDED",
        couponId,
        discountAmount: course.discountPrice || course.price,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath(`/courses/${course.slug}`);
    revalidatePath(`/checkout/${courseId}`);
    
    return { success: true, courseSlug: course.slug };
  } catch (error) {
    console.error("Create free enrollment error:", error);
    return { error: "Failed to create enrollment" };
  }
}
