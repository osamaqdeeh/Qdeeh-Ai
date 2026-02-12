import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CreateCourseForm } from "@/components/admin/create-course-form";

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  
  const { id } = await params;

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      sections: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!course) {
    notFound();
  }

  // Transform to match the expected type
  const courseData = {
    ...course,
    sections: course.sections.map(s => ({
      id: s.id,
      title: s.title,
      description: s.description || "",
      order: s.order,
    })),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Course</h1>
        <p className="text-muted-foreground mt-2">
          Update course details and content
        </p>
      </div>

      <CreateCourseForm course={courseData} />
    </div>
  );
}
