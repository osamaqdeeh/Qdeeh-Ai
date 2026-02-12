"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Tag, CheckCircle2, XCircle } from "lucide-react";
import { validateCoupon } from "@/lib/actions/coupons";
import { createPaymentIntent } from "@/lib/actions/payment";
import { createFreeEnrollment } from "@/lib/actions/enrollment";
import { useToast } from "@/components/ui/use-toast";

interface CheckoutFormProps {
  courseId: string;
  courseTitle: string;
  basePrice: number;
  originalPrice: number;
}

interface CouponData {
  id: string;
  code: string;
  discountAmount: number;
  discountType: string;
  discountValue: number;
}

export function CheckoutForm({ courseId, courseTitle, basePrice, originalPrice }: CheckoutFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponData | null>(null);
  const [couponError, setCouponError] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    setIsValidatingCoupon(true);
    setCouponError("");

    try {
      const result = await validateCoupon(couponCode.trim(), courseId, basePrice);

      if (result.error) {
        setCouponError(result.error);
        setAppliedCoupon(null);
      } else if (result.success && result.coupon) {
        setAppliedCoupon(result.coupon);
        toast({
          title: "Coupon Applied!",
          description: `You saved ${formatPrice(result.coupon.discountAmount)}`,
        });
      }
    } catch {
      setCouponError("Failed to validate coupon");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const calculateFinalPrice = () => {
    if (appliedCoupon) {
      return Math.max(0, basePrice - appliedCoupon.discountAmount);
    }
    return basePrice;
  };

  const handleCheckout = async () => {
    setIsProcessing(true);

    try {
      const finalPrice = calculateFinalPrice();

      // If course is free (100% discount), enroll directly without payment
      if (finalPrice === 0) {
        const result = await createFreeEnrollment(courseId, appliedCoupon?.code);

        if (result.error) {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          });
        } else if (result.success) {
          toast({
            title: "Enrolled Successfully!",
            description: "You now have access to the course",
          });
          // Redirect to success page
          router.push(`/checkout/success?course=${result.courseSlug}`);
        }
      } else {
        // Process paid enrollment
        const result = await createPaymentIntent(
          courseId,
          appliedCoupon?.code
        );

        if (result.error) {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          });
        } else if (result.success && result.clientSecret) {
          // Redirect to payment page with Stripe Elements
          router.push(`/checkout/${courseId}/payment?client_secret=${result.clientSecret}`);
        }
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to process checkout",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const finalPrice = calculateFinalPrice();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
        <CardDescription>Apply a coupon and complete your purchase</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Coupon Section */}
        <div className="space-y-2">
          <Label htmlFor="coupon">Coupon Code</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="coupon"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value.toUpperCase());
                  setCouponError("");
                }}
                disabled={!!appliedCoupon || isValidatingCoupon}
                className="pl-9"
              />
            </div>
            {!appliedCoupon ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleApplyCoupon}
                disabled={isValidatingCoupon || !couponCode.trim()}
              >
                {isValidatingCoupon ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Apply"
                )}
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={handleRemoveCoupon}
              >
                Remove
              </Button>
            )}
          </div>
          {couponError && (
            <div className="flex items-center gap-1 text-sm text-destructive">
              <XCircle className="h-3 w-3" />
              <span>{couponError}</span>
            </div>
          )}
          {appliedCoupon && (
            <div className="flex items-center gap-1 text-sm text-green-600">
              <CheckCircle2 className="h-3 w-3" />
              <span>
                Coupon applied! You saved {formatPrice(appliedCoupon.discountAmount)}
              </span>
            </div>
          )}
        </div>

        {/* Price Breakdown */}
        <div className="space-y-2 border-t pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Original Price:</span>
            <span className={basePrice < originalPrice ? "line-through" : ""}>
              {formatPrice(originalPrice)}
            </span>
          </div>
          {basePrice < originalPrice && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Discounted Price:</span>
              <span>{formatPrice(basePrice)}</span>
            </div>
          )}
          {appliedCoupon && (
            <div className="flex items-center justify-between text-sm text-green-600">
              <span>Coupon Discount:</span>
              <span>-{formatPrice(appliedCoupon.discountAmount)}</span>
            </div>
          )}
          <div className="flex items-center justify-between border-t pt-2 text-lg font-bold">
            <span>Total:</span>
            <span>{formatPrice(finalPrice)}</span>
          </div>
        </div>

        {/* Course Access Info */}
        <div className="rounded-lg bg-muted p-3 text-sm">
          <p className="font-medium">What you'll get:</p>
          <ul className="mt-2 space-y-1 text-muted-foreground">
            <li>✓ Lifetime access to {courseTitle}</li>
            <li>✓ All course materials and resources</li>
            <li>✓ Certificate of completion</li>
            <li>✓ Access to course updates</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          size="lg"
          onClick={handleCheckout}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : finalPrice === 0 ? (
            "Enroll for Free"
          ) : (
            `Pay ${formatPrice(finalPrice)}`
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
