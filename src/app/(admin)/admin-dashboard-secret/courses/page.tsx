import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { CoursesTable } from "@/components/admin/courses-table";

export default async function AdminCoursesPage() {
  await requireAdmin();

  const courses = await prisma.course.findMany({
    include: {
      _count: {
        select: {
          enrollments: true,
          sections: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Courses Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage all courses, create new ones, and edit existing content
          </p>
        </div>
        <Button asChild>
          <Link href="/admin-dashboard-secret/courses/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Course
          </Link>
        </Button>
      </div>

      <CoursesTable courses={courses} />
    </div>
  );
}
