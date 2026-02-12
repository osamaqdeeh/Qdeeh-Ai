"use server";

import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";

export async function createPaymentIntent(courseId: string, couponCode?: string) {
  try {
    const stripe = getStripe();
    const user = await getCurrentUser();

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

    let amount = course.discountPrice || course.price;
    let couponId: string | undefined;
    let discountAmount: number | undefined;

    // Apply coupon if provided
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
        include: { courses: true },
      });

      if (coupon && coupon.isActive) {
        const now = new Date();
        if (
          coupon.validFrom <= now &&
          (!coupon.validUntil || coupon.validUntil >= now) &&
          (!coupon.maxUses || coupon.currentUses < coupon.maxUses)
        ) {
          // Check course restriction
          const validForCourse =
            coupon.courses.length === 0 ||
            coupon.courses.some((c) => c.courseId === courseId);

          if (validForCourse) {
            if (coupon.discountType === "PERCENTAGE") {
              discountAmount = (amount * coupon.discountValue) / 100;
            } else {
              discountAmount = Math.min(coupon.discountValue, amount);
            }
            amount -= discountAmount;
            couponId = coupon.id;
          }
        }
      }
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      metadata: {
        userId: user.id,
        courseId,
        ...(couponId && { couponId }),
      },
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        studentId: user.id,
        courseId,
        amount,
        status: "PENDING",
        stripePaymentIntentId: paymentIntent.id,
        couponId,
        discountAmount,
      },
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      amount,
    };
  } catch (error) {
    console.error("Create payment intent error:", error);
    return { error: "Failed to create payment intent" };
  }
}

export async function handleSuccessfulPayment(paymentIntentId: string) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { stripePaymentIntentId: paymentIntentId },
    });

    if (!payment) {
      throw new Error("Payment not found");
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "SUCCEEDED" },
    });

    // Create enrollment
    await prisma.enrollment.create({
      data: {
        studentId: payment.studentId,
        courseId: payment.courseId,
      },
    });

    // Update course student count
    await prisma.course.update({
      where: { id: payment.courseId },
      data: {
        studentsCount: {
          increment: 1,
        },
      },
    });

    // Update coupon usage if applicable
    if (payment.couponId) {
      await prisma.coupon.update({
        where: { id: payment.couponId },
        data: {
          currentUses: {
            increment: 1,
          },
        },
      });
    }

    revalidatePath("/dashboard");
    revalidatePath(`/checkout/${payment.courseId}`);
    
    // Get course slug for revalidation
    const course = await prisma.course.findUnique({
      where: { id: payment.courseId },
      select: { slug: true },
    });
    
    if (course) {
      revalidatePath(`/courses/${course.slug}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error("Handle successful payment error:", error);
    return { error: "Failed to process payment" };
  }
}
