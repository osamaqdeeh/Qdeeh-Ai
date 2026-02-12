"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { MoreHorizontal, Edit, Trash, Eye, CheckCircle } from "lucide-react";
import Link from "next/link";
import { formatPrice, formatDate } from "@/lib/utils";
import { deleteCourse, publishCourse } from "@/lib/actions/courses";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import type { Course } from "@prisma/client";

interface CoursesTableProps {
  courses: (Course & {
    _count: {
      enrollments: number;
      sections: number;
    };
  })[];
}

export function CoursesTable({ courses }: CoursesTableProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleDelete = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    setLoading(courseId);
    const result = await deleteCourse(courseId);
    setLoading(null);

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Course deleted successfully",
      });
      router.refresh();
    }
  };

  const handlePublish = async (courseId: string) => {
    setLoading(courseId);
    const result = await publishCourse(courseId);
    setLoading(null);

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Course published successfully",
      });
      router.refresh();
    }
  };

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Students</TableHead>
            <TableHead>Sections</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map((course) => (
            <TableRow key={course.id}>
              <TableCell className="font-medium max-w-xs truncate">
                {course.title}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    course.status === "PUBLISHED"
                      ? "default"
                      : course.status === "DRAFT"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {course.status}
                </Badge>
              </TableCell>
              <TableCell>{formatPrice(course.price)}</TableCell>
              <TableCell>{course._count.enrollments}</TableCell>
              <TableCell>{course._count.sections}</TableCell>
              <TableCell>{formatDate(course.createdAt)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={loading === course.id}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/courses/${course.slug}`} target="_blank">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/admin-dashboard-secret/courses/${course.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    {course.status === "DRAFT" && (
                      <DropdownMenuItem onClick={() => handlePublish(course.id)}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Publish
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => handleDelete(course.id)}
                      className="text-destructive"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
