import { prisma } from "@/lib/prisma";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

interface CourseReviewsProps {
  courseId: string;
}

export async function CourseReviews({ courseId }: CourseReviewsProps) {
  const reviews = await prisma.review.findMany({
    where: {
      courseId,
      approved: true,
    },
    include: {
      student: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No reviews yet. Be the first to review this course!</p>
      </div>
    );
  }

  // Calculate rating distribution
  const ratingCounts = [0, 0, 0, 0, 0];
  reviews.forEach((review) => {
    ratingCounts[review.rating - 1]++;
  });

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  return (
    <div className="space-y-8">
      {/* Rating Overview */}
      <div className="flex flex-col md:flex-row gap-8">
        <div className="text-center">
          <div className="text-5xl font-bold">{averageRating.toFixed(1)}</div>
          <div className="flex justify-center gap-1 my-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < Math.round(averageRating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">{reviews.length} reviews</p>
        </div>

        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = ratingCounts[rating - 1];
            const percentage = (count / reviews.length) * 100;
            return (
              <div key={rating} className="flex items-center gap-2">
                <div className="flex gap-1 w-20">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-12 text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Student Reviews</h3>
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarImage src={review.student.image || undefined} />
                  <AvatarFallback>
                    {review.student.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold">{review.student.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatRelativeTime(review.createdAt)}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-muted-foreground">{review.comment}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
