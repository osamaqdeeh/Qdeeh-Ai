"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireAdmin } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";

type ReviewInput = {
  courseId: string;
  rating: number;
  comment?: string;
};

export async function createReview(data: ReviewInput) {
  try {
    const user = await getCurrentUser();

    // Check if user is enrolled
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: user.id,
          courseId: data.courseId,
        },
      },
    });

    if (!enrollment) {
      return { error: "You must be enrolled in this course to leave a review" };
    }

    // Check if already reviewed
    const existingReview = await prisma.review.findUnique({
      where: {
        studentId_courseId: {
          studentId: user.id,
          courseId: data.courseId,
        },
      },
    });

    if (existingReview) {
      return { error: "You have already reviewed this course" };
    }

    const review = await prisma.review.create({
      data: {
        studentId: user.id,
        courseId: data.courseId,
        rating: data.rating,
        comment: data.comment,
      },
    });

    // Update course rating
    await updateCourseRating(data.courseId);

    revalidatePath(`/courses/${data.courseId}`);
    return { success: true, review };
  } catch (error) {
    console.error("Create review error:", error);
    return { error: "Failed to create review" };
  }
}

export async function approveReview(reviewId: string) {
  try {
    await requireAdmin();

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: { approved: true },
    });

    revalidatePath("/admin-dashboard-secret/reviews");
    revalidatePath(`/courses/${review.courseId}`);
    return { success: true };
  } catch (error) {
    console.error("Approve review error:", error);
    return { error: "Failed to approve review" };
  }
}

export async function deleteReview(reviewId: string) {
  try {
    await requireAdmin();

    const review = await prisma.review.delete({
      where: { id: reviewId },
    });

    await updateCourseRating(review.courseId);

    revalidatePath("/admin-dashboard-secret/reviews");
    revalidatePath(`/courses/${review.courseId}`);
    return { success: true };
  } catch (error) {
    console.error("Delete review error:", error);
    return { error: "Failed to delete review" };
  }
}

async function updateCourseRating(courseId: string) {
  const reviews = await prisma.review.findMany({
    where: {
      courseId,
      approved: true,
    },
  });

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  await prisma.course.update({
    where: { id: courseId },
    data: {
      rating: averageRating,
      reviewsCount: reviews.length,
    },
  });
}
