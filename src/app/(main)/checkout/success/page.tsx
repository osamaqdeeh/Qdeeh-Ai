import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ArrowRight, BookOpen } from "lucide-react";

export default function CheckoutSuccessPage() {
  return (
    <div className="container max-w-2xl py-12">
      <Suspense fallback={<div>Loading...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}

function SuccessContent() {
  return (
    <Card className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
          <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>
        <CardTitle className="text-2xl">Payment Successful!</CardTitle>
        <CardDescription className="text-base">
          Congratulations! You're now enrolled in the course.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-white p-4 dark:bg-gray-950">
          <h3 className="mb-2 font-semibold">What&apos;s Next?</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-green-600">✓</span>
              <span>You now have lifetime access to all course materials</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-green-600">✓</span>
              <span>A confirmation email has been sent to your inbox</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-green-600">✓</span>
              <span>Start learning right away from your dashboard</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-green-600">✓</span>
              <span>You&apos;ll receive a certificate upon course completion</span>
            </li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 sm:flex-row">
        <Button asChild className="w-full sm:flex-1" size="lg">
          <Link href="/dashboard">
            <BookOpen className="mr-2 h-4 w-4" />
            Go to Dashboard
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full sm:flex-1" size="lg">
          <Link href="/courses">
            Browse More Courses
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
