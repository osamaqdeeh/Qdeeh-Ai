import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return new NextResponse("Missing signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        const payment = await prisma.payment.findUnique({
          where: { stripePaymentIntentId: paymentIntent.id },
        });

        if (payment) {
          // Update payment status
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: "SUCCEEDED" },
          });

          // Check if enrollment already exists
          const existingEnrollment = await prisma.enrollment.findUnique({
            where: {
              studentId_courseId: {
                studentId: payment.studentId,
                courseId: payment.courseId,
              },
            },
          });

          if (!existingEnrollment) {
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
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        await prisma.payment.updateMany({
          where: { stripePaymentIntentId: paymentIntent.id },
          data: { status: "FAILED" },
        });
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return new NextResponse("Webhook handler failed", { status: 500 });
  }
}
