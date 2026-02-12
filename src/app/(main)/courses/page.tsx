import { prisma } from "@/lib/prisma";
import { CourseCard } from "@/components/course-card";
import { CourseFilters } from "@/components/courses/course-filters";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

interface CoursesPageProps {
  searchParams: Promise<{
    category?: string;
    level?: string;
    search?: string;
    sort?: string;
  }>;
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const params = await searchParams;
  const { category, level, search, sort = "newest" } = params;

  // Build where clause
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    status: "PUBLISHED",
    ...(category && { categoryId: category }),
    ...(level && { level }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  // Build order by
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orderBy: any = (() => {
    switch (sort) {
      case "popular":
        return { studentsCount: "desc" };
      case "rating":
        return { rating: "desc" };
      case "price-low":
        return { price: "asc" };
      case "price-high":
        return { price: "desc" };
      default:
        return { createdAt: "desc" };
    }
  })();

  const [courses, categories] = await Promise.all([
    prisma.course.findMany({
      where,
      include: {
        category: true,
      },
      orderBy,
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">All Courses</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Explore our comprehensive library of courses
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 shrink-0">
          <CourseFilters categories={categories} />
        </aside>

        <div className="flex-1">
          {courses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">No courses found</p>
              <p className="text-sm text-muted-foreground mt-2">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-muted-foreground">
                {courses.length} {courses.length === 1 ? "course" : "courses"} found
              </div>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
