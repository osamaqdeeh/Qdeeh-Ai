import { requireAdmin } from "@/lib/auth-helpers";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CreateCourseForm } from "@/components/admin/create-course-form";

export default async function NewCoursePage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin-dashboard-secret/courses">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Course</h1>
          <p className="text-muted-foreground mt-2">
            Add a new course to the platform
          </p>
        </div>
      </div>

      <CreateCourseForm categories={[]} />
    </div>
  );
}
