import Stripe from "stripe";

// Only initialize Stripe if the key is available
// This allows the app to build even if Stripe is not configured yet
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20",
      typescript: true,
    })
  : null;

// Helper to check if Stripe is configured
export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

// Helper to get Stripe instance or throw
export function getStripe(): Stripe {
  if (!stripe) {
    throw new Error("Stripe is not configured. Please set STRIPE_SECRET_KEY in your .env file");
  }
  return stripe;
}
