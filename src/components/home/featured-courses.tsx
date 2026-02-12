import { prisma } from "@/lib/prisma";
import { CourseCard } from "@/components/course-card";
import { cache } from "react";

// Cache the query to prevent duplicate calls
const getFeaturedCourses = cache(async () => {
  try {
    return await prisma.course.findMany({
      where: {
        status: "PUBLISHED",
      },
      include: {
        category: true,
      },
      orderBy: {
        studentsCount: "desc",
      },
      take: 6,
    });
  } catch (error) {
    // During build time without DATABASE_URL, return empty array
    console.warn("Database not available, returning empty courses");
    return [];
  }
});

export async function FeaturedCourses() {
  const courses = await getFeaturedCourses();

  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No courses available yet. Check back soon!
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
