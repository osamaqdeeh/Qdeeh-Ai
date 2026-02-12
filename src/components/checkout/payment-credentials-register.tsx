"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CreditCard, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { savePaymentCredentials } from "@/lib/actions/payment-credentials";

interface PaymentCredentialsRegisterProps {
  courseId: string;
  amount: number;
  couponCode?: string;
}

export function PaymentCredentialsRegister({ courseId, amount, couponCode }: PaymentCredentialsRegisterProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    cardholderName: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "");
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
    return formatted.substring(0, 19);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    if (!formData.cardNumber || !formData.expiryMonth || !formData.expiryYear || !formData.cvv || !formData.cardholderName) {
      setError("Please fill in all fields");
      setIsProcessing(false);
      return;
    }

    try {
      const result = await savePaymentCredentials(formData);

      if (result.error) {
        setError(result.error);
        toast({
          title: "Registration Failed",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Credentials Saved!",
          description: "Your payment information has been registered. Redirecting...",
        });

        // Redirect back to payment page so user can now enter their credentials
        setTimeout(() => {
          router.refresh();
        }, 1500);
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Register Payment Information
        </CardTitle>
        <CardDescription>
          First time user: Please register your card details in our database
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Info Alert */}
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              <strong>Step 1 of 2:</strong> Save your card details to our database. You'll then use these same details to complete payments.
            </AlertDescription>
          </Alert>

          {/* Card Number */}
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              type="text"
              placeholder="1234 5678 9012 3456"
              value={formData.cardNumber}
              onChange={(e) => handleInputChange("cardNumber", formatCardNumber(e.target.value))}
              maxLength={19}
              disabled={isProcessing}
            />
          </div>

          {/* Cardholder Name */}
          <div className="space-y-2">
            <Label htmlFor="cardholderName">Cardholder Name</Label>
            <Input
              id="cardholderName"
              type="text"
              placeholder="John Doe"
              value={formData.cardholderName}
              onChange={(e) => handleInputChange("cardholderName", e.target.value)}
              disabled={isProcessing}
            />
          </div>

          {/* Expiry and CVV */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryMonth">Month</Label>
              <Input
                id="expiryMonth"
                type="text"
                placeholder="12"
                value={formData.expiryMonth}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").substring(0, 2);
                  handleInputChange("expiryMonth", value);
                }}
                maxLength={2}
                disabled={isProcessing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryYear">Year</Label>
              <Input
                id="expiryYear"
                type="text"
                placeholder="2025"
                value={formData.expiryYear}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").substring(0, 4);
                  handleInputChange("expiryYear", value);
                }}
                maxLength={4}
                disabled={isProcessing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                type="text"
                placeholder="123"
                value={formData.cvv}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").substring(0, 4);
                  handleInputChange("cvv", value);
                }}
                maxLength={4}
                disabled={isProcessing}
              />
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Payment Amount Info */}
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Course Amount:</span>
              <span className="text-2xl font-bold">
                ${amount.toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              After registration, you'll enter these same details to complete payment
            </p>
          </div>

          {/* Submit Button */}
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
                  Saving Credentials...
                </>
              ) : (
                "Save Payment Information"
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
            Your payment information will be stored securely in our database
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
