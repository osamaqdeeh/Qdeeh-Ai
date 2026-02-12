"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { DiscountType } from "@prisma/client";

const couponSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  discountType: z.nativeEnum(DiscountType),
  discountValue: z.number().min(0),
  maxUses: z.number().positive().optional().nullable(), // positive() allows any number > 0, or null for unlimited
  maxUsesPerUser: z.number().positive().optional().nullable(), // Leave empty for unlimited per user
  minPurchaseAmount: z.number().min(0).optional().nullable(),
  validFrom: z.date().default(() => new Date()),
  validUntil: z.date().optional().nullable(),
  courseIds: z.array(z.string()).optional(),
});

export async function createCoupon(data: z.infer<typeof couponSchema>) {
  try {
    await requireAdmin();

    const validated = couponSchema.parse(data);

    // Check if coupon code already exists
    const existing = await prisma.coupon.findUnique({
      where: { code: validated.code },
    });

    if (existing) {
      return { error: "Coupon code already exists" };
    }

    const { courseIds, ...couponData } = validated;

    const coupon = await prisma.coupon.create({
      data: {
        ...couponData,
        ...(courseIds && courseIds.length > 0 && {
          courses: {
            create: courseIds.map((courseId) => ({
              courseId,
            })),
          },
        }),
      },
    });

    revalidatePath("/admin-dashboard-secret/coupons", "page");
    return { success: true, coupon };
  } catch (error) {
    console.error("Create coupon error:", error);
    return { error: "Failed to create coupon" };
  }
}

export async function validateCoupon(code: string, courseId: string, amount: number) {
  try {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        courses: true,
      },
    });

    if (!coupon) {
      return { error: "Invalid coupon code" };
    }

    if (!coupon.isActive) {
      return { error: "Coupon is not active" };
    }

    const now = new Date();
    if (coupon.validFrom > now) {
      return { error: "Coupon is not yet valid" };
    }

    if (coupon.validUntil && coupon.validUntil < now) {
      return { error: "Coupon has expired" };
    }

    if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
      return { error: "Coupon usage limit reached" };
    }

    if (coupon.minPurchaseAmount && amount < coupon.minPurchaseAmount) {
      return { error: `Minimum purchase amount is $${coupon.minPurchaseAmount}` };
    }

    // Check course restrictions
    if (coupon.courses.length > 0) {
      const validForCourse = coupon.courses.some((c) => c.courseId === courseId);
      if (!validForCourse) {
        return { error: "Coupon is not valid for this course" };
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === DiscountType.PERCENTAGE) {
      discountAmount = (amount * coupon.discountValue) / 100;
    } else {
      discountAmount = Math.min(coupon.discountValue, amount);
    }

    return {
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountAmount,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
    };
  } catch (error) {
    console.error("Validate coupon error:", error);
    return { error: "Failed to validate coupon" };
  }
}

export async function deleteCoupon(couponId: string) {
  try {
    await requireAdmin();

    await prisma.coupon.delete({
      where: { id: couponId },
    });

    revalidatePath("/admin-dashboard-secret/coupons", "page");
    return { success: true };
  } catch (error) {
    console.error("Delete coupon error:", error);
    return { error: "Failed to delete coupon" };
  }
}

export async function toggleCouponStatus(couponId: string) {
  try {
    await requireAdmin();

    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId },
    });

    if (!coupon) {
      return { error: "Coupon not found" };
    }

    await prisma.coupon.update({
      where: { id: couponId },
      data: { isActive: !coupon.isActive },
    });

    revalidatePath("/admin-dashboard-secret/coupons", "page");
    return { success: true };
  } catch (error) {
    console.error("Toggle coupon error:", error);
    return { error: "Failed to toggle coupon status" };
  }
}
