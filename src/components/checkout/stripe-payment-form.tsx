"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface StripePaymentFormProps {
  clientSecret: string;
  courseId: string;
  courseSlug: string;
}

export function StripePaymentForm({ clientSecret, courseId, courseSlug }: StripePaymentFormProps) {
  // clientSecret will be used when integrating real Stripe Elements
  console.log("Payment intent:", clientSecret);
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Load Stripe.js
    const loadStripe = async () => {
      try {
        // Check if Stripe is configured
        const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
        if (!publishableKey) {
          setError("Stripe is not configured. Please contact support.");
          setIsLoading(false);
          return;
        }

        // In a real implementation, you would load Stripe Elements here
        // For now, we'll simulate the loading
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsLoading(false);
      } catch {
        setError("Failed to load payment form");
        setIsLoading(false);
      }
    };

    loadStripe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    try {
      // In a real implementation, you would:
      // 1. Use Stripe Elements to collect card details
      // 2. Confirm the payment with Stripe
      // 3. Handle the webhook for successful payment
      
      // For demonstration, we'll simulate a successful payment
      toast({
        title: "Payment Successful!",
        description: "Redirecting to your course...",
      });

      // Refresh router to clear cache
      router.refresh();

      // Redirect to success page or course
      setTimeout(() => {
        router.push(`/checkout/success?course=${courseSlug}`);
      }, 1500);
    } catch {
      setError("Payment failed. Please try again.");
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-sm text-muted-foreground">Loading payment form...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button
            className="mt-4 w-full"
            variant="outline"
            onClick={() => router.push(`/checkout/${courseId}`)}
          >
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Information</CardTitle>
        <CardDescription>
          Your payment is secured by Stripe
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Stripe Elements would be embedded here */}
          <div className="rounded-lg border border-dashed border-muted-foreground/25 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Stripe Payment Elements will be embedded here
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              To complete integration, add your Stripe publishable key to .env
            </p>
          </div>

          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              <strong>Test Mode:</strong> This is a demo payment form. In production, Stripe
              Elements will be embedded here for secure card payments.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                "Complete Payment"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => router.push(`/checkout/${courseId}`)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            By completing this purchase, you agree to our terms of service
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
