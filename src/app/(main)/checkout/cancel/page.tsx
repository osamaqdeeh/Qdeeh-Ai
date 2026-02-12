import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, ArrowLeft } from "lucide-react";

export default function CheckoutCancelPage() {
  return (
    <div className="container max-w-2xl py-12">
      <Card className="border-yellow-200 bg-yellow-50/50 dark:border-yellow-900 dark:bg-yellow-950/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
            <XCircle className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
          </div>
          <CardTitle className="text-2xl">Payment Cancelled</CardTitle>
          <CardDescription className="text-base">
            Your payment was not completed. No charges were made.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-white p-4 dark:bg-gray-950">
            <h3 className="mb-2 font-semibold">What happened?</h3>
            <p className="text-sm text-muted-foreground">
              You cancelled the payment process or closed the payment window. Don&apos;t worry - 
              you can try again whenever you&apos;re ready. Your cart is still available.
            </p>
          </div>
          <div className="rounded-lg bg-white p-4 dark:bg-gray-950">
            <h3 className="mb-2 font-semibold">Need Help?</h3>
            <p className="text-sm text-muted-foreground">
              If you experienced any issues during checkout, please contact our support team.
              We&apos;re here to help you get enrolled in your desired course.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 sm:flex-row">
          <Button asChild variant="default" className="w-full sm:flex-1" size="lg">
            <Link href="/courses">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Browse Courses
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:flex-1" size="lg">
            <Link href="/dashboard">
              Go to Dashboard
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
