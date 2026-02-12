"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface EnrollButtonProps {
  courseId: string;
  courseSlug: string;
  isEnrolled: boolean;
  isAuthenticated: boolean;
}

export function EnrollButton({ courseId, courseSlug, isEnrolled, isAuthenticated }: EnrollButtonProps) {
  const router = useRouter();

  if (isEnrolled) {
    return (
      <Button className="w-full" size="lg" asChild>
        <Link href={`/learn/${courseSlug}`}>Go to Course</Link>
      </Button>
    );
  }

  if (!isAuthenticated) {
    return (
      <Button className="w-full" size="lg" asChild>
        <Link href="/auth/signin">Sign In to Enroll</Link>
      </Button>
    );
  }

  return (
    <Button
      className="w-full"
      size="lg"
      onClick={() => router.push(`/checkout/${courseId}`)}
    >
      Enroll Now
    </Button>
  );
}
