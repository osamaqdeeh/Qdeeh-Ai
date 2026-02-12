"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";

// Simple encryption for card data (in production, use proper encryption)
function encryptData(data: string): string {
  return Buffer.from(data).toString('base64');
}

function decryptData(encrypted: string): string {
  return Buffer.from(encrypted, 'base64').toString('utf-8');
}

interface CardCredentials {
  cardNumber: string;
  cardholderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

// Check if user has saved payment credentials
export async function hasPaymentCredentials() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return { error: "You must be signed in" };
    }

    const credentials = await prisma.paymentCredentials.findUnique({
      where: { studentId: user.id },
    });

    return { 
      hasCredentials: !!credentials,
      studentId: user.id 
    };
  } catch (error) {
    console.error("Check payment credentials error:", error);
    return { error: "Failed to check payment credentials" };
  }
}

// Save new payment credentials to database
export async function savePaymentCredentials(cardData: CardCredentials) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return { error: "You must be signed in" };
    }

    // Check if credentials already exist
    const existing = await prisma.paymentCredentials.findUnique({
      where: { studentId: user.id },
    });

    if (existing) {
      return { error: "Payment credentials already registered. Please use the payment form." };
    }

    // Validate input
    if (!cardData.cardNumber || !cardData.cardholderName || !cardData.expiryMonth || !cardData.expiryYear || !cardData.cvv) {
      return { error: "All fields are required" };
    }

    // Clean card number (remove spaces)
    const cleanCardNumber = cardData.cardNumber.replace(/\s/g, "");

    // Basic validation
    if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
      return { error: "Invalid card number length" };
    }

    if (cardData.expiryMonth.length !== 2 || parseInt(cardData.expiryMonth) < 1 || parseInt(cardData.expiryMonth) > 12) {
      return { error: "Invalid expiry month (use 01-12)" };
    }

    if (cardData.expiryYear.length !== 4 || parseInt(cardData.expiryYear) < new Date().getFullYear()) {
      return { error: "Invalid or expired year" };
    }

    if (cardData.cvv.length < 3 || cardData.cvv.length > 4) {
      return { error: "Invalid CVV" };
    }

    // Encrypt sensitive data before storing
    const credentials = await prisma.paymentCredentials.create({
      data: {
        studentId: user.id,
        cardNumber: encryptData(cleanCardNumber),
        cardholderName: cardData.cardholderName,
        expiryMonth: cardData.expiryMonth,
        expiryYear: cardData.expiryYear,
        cvv: encryptData(cardData.cvv),
      },
    });

    return { 
      success: true, 
      message: "Payment credentials saved successfully!",
      credentialsId: credentials.id 
    };
  } catch (error) {
    console.error("Save payment credentials error:", error);
    return { error: "Failed to save payment credentials" };
  }
}

// Validate entered credentials against stored ones
export async function validatePaymentCredentials(
  cardData: CardCredentials,
  courseId: string,
  amount: number,
  couponCode?: string
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return { error: "You must be signed in" };
    }

    // Get stored credentials
    const storedCredentials = await prisma.paymentCredentials.findUnique({
      where: { studentId: user.id },
    });

    if (!storedCredentials) {
      return { error: "No payment credentials found. Please register your card first." };
    }

    // Clean input
    const cleanCardNumber = cardData.cardNumber.replace(/\s/g, "");

    // Decrypt stored data and compare
    const storedCardNumber = decryptData(storedCredentials.cardNumber);
    const storedCVV = decryptData(storedCredentials.cvv);

    const isValid =
      cleanCardNumber === storedCardNumber &&
      cardData.cardholderName.toLowerCase().trim() === storedCredentials.cardholderName.toLowerCase().trim() &&
      cardData.expiryMonth === storedCredentials.expiryMonth &&
      cardData.expiryYear === storedCredentials.expiryYear &&
      cardData.cvv === storedCVV;

    if (!isValid) {
      return { error: "Your data are Wrong" };
    }

    // Credentials are valid - process payment
    return await processPayment(courseId, amount, couponCode);
  } catch (error) {
    console.error("Validate payment credentials error:", error);
    return { error: "Failed to validate payment credentials" };
  }
}

// Process the payment after validation
async function processPayment(
  courseId: string,
  amount: number,
  couponCode?: string
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return { error: "You must be signed in" };
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
    let discountAmount: number | undefined;

    // Apply coupon if provided
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });

      if (coupon && coupon.isActive) {
        const now = new Date();
        if (
          coupon.validFrom <= now &&
          (!coupon.validUntil || coupon.validUntil >= now) &&
          (!coupon.maxUses || coupon.currentUses < coupon.maxUses)
        ) {
          couponId = coupon.id;
          if (coupon.discountType === "PERCENTAGE") {
            discountAmount = (amount * coupon.discountValue) / 100;
          } else {
            discountAmount = Math.min(coupon.discountValue, amount);
          }
        }
      }
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        studentId: user.id,
        courseId,
        amount,
        status: "SUCCEEDED",
        couponId,
        discountAmount,
        metadata: {
          paymentMethod: "user_card",
        },
      },
    });

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

    // Update coupon usage if applicable
    if (couponId) {
      await prisma.coupon.update({
        where: { id: couponId },
        data: {
          currentUses: {
            increment: 1,
          },
        },
      });
    }

    // Track admin revenue
    await trackAdminRevenue(amount);

    revalidatePath("/dashboard");
    revalidatePath(`/checkout/${courseId}`);
    revalidatePath(`/courses/${course.slug}`);

    return {
      success: true,
      courseSlug: course.slug,
      paymentId: payment.id,
    };
  } catch (error) {
    console.error("Process payment error:", error);
    return { error: "Failed to process payment" };
  }
}

async function trackAdminRevenue(amount: number) {
  try {
    const superAdmin = await prisma.admin.findFirst({
      where: { isSuperAdmin: true },
    });

    if (superAdmin) {
      await prisma.adminActivityLog.create({
        data: {
          adminId: superAdmin.id,
          action: "REVENUE_RECEIVED",
          entityType: "PAYMENT",
          details: {
            amount,
            timestamp: new Date().toISOString(),
          },
        },
      });
    }
  } catch (error) {
    console.error("Failed to track admin revenue:", error);
  }
}
