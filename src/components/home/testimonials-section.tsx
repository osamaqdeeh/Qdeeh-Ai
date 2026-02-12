import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { cache } from "react";

// Cache the testimonials query
const getTestimonials = cache(async () => {
  try {
    return await prisma.review.findMany({
      where: {
        approved: true,
        rating: { gte: 4 },
      },
      include: {
        student: {
          select: {
            name: true,
            image: true,
          },
        },
        course: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 6,
    });
  } catch (error) {
    console.warn("Database not available, returning empty testimonials");
    return [];
  }
});

export async function TestimonialsSection() {
  const reviews = await getTestimonials();

  if (reviews.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            What Our Students Say
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Real feedback from real learners
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar>
                    <AvatarImage src={review.student.image || undefined} />
                    <AvatarFallback>
                      {review.student.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{review.student.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {review.course.title}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
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
                <p className="text-sm text-muted-foreground line-clamp-4">
                  {review.comment}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
