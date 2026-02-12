import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Users, Clock } from "lucide-react";
import { formatPrice, formatDuration } from "@/lib/utils";
import type { Course, Category } from "@prisma/client";

interface CourseCardProps {
  course: Course & {
    category: Category;
  };
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/courses/${course.slug}`}>
      <Card className="h-full overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
        <div className="relative h-48 w-full overflow-hidden bg-muted">
          {course.thumbnail ? (
            <Image
              src={course.thumbnail}
              alt={course.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge>{course.category.name}</Badge>
          </div>
        </div>
        <CardHeader>
          <h3 className="line-clamp-2 text-lg font-semibold">{course.title}</h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {course.shortDescription || course.description}
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{course.rating.toFixed(1)}</span>
              <span>({course.reviewsCount})</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{course.studentsCount}</span>
            </div>
            {course.duration && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(course.duration * 60)}</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div>
            {course.discountPrice ? (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">
                  {formatPrice(course.discountPrice)}
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(course.price)}
                </span>
              </div>
            ) : (
              <span className="text-2xl font-bold">{formatPrice(course.price)}</span>
            )}
          </div>
          <Badge variant="outline">{course.level}</Badge>
        </CardFooter>
      </Card>
    </Link>
  );
}
