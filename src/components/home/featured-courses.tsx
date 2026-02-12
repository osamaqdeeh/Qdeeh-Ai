import { prisma } from "@/lib/prisma";
import { CourseCard } from "@/components/course-card";
import { cache } from "react";

// Cache the query to prevent duplicate calls
const getFeaturedCourses = cache(async () => {
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
});

export async function FeaturedCourses() {
  const courses = await getFeaturedCourses();

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
