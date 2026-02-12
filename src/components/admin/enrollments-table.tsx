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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Trash2, Tag, DollarSign, Calendar } from "lucide-react";
import { deleteEnrollment } from "@/lib/actions/admin";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface EnrollmentWithDetails {
  id: string;
  studentId: string;
  courseId: string;
  progress: number;
  createdAt: Date;
  student: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  course: {
    id: string;
    title: string;
    slug: string;
    price: number;
    discountPrice: number | null;
  };
  payment?: {
    id: string;
    amount: number;
    status: string;
    coupon: {
      code: string;
      discountType: string;
      discountValue: number;
    } | null;
  } | null;
}

interface EnrollmentsTableProps {
  enrollments: EnrollmentWithDetails[];
}

export function EnrollmentsTable({ enrollments }: EnrollmentsTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const result = await deleteEnrollment(deleteId);

      if (result.success) {
        toast({
          title: "Enrollment Deleted",
          description: "The enrollment has been removed and the student will need to re-purchase.",
        });
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete enrollment",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Coupon Used</TableHead>
              <TableHead>Enrolled</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enrollments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No enrollments found
                </TableCell>
              </TableRow>
            ) : (
              enrollments.map((enrollment) => (
                <TableRow key={enrollment.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={enrollment.student.image || undefined} />
                        <AvatarFallback>
                          {enrollment.student.name?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{enrollment.student.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {enrollment.student.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <div className="font-medium">{enrollment.course.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatPrice(enrollment.course.discountPrice || enrollment.course.price)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="w-24">
                      <Progress value={enrollment.progress} className="h-2" />
                      <div className="mt-1 text-xs text-muted-foreground">
                        {Math.round(enrollment.progress)}%
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {enrollment.payment ? (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {enrollment.payment.amount === 0
                              ? "Free"
                              : formatPrice(enrollment.payment.amount)}
                          </div>
                          <Badge
                            variant={
                              enrollment.payment.status === "SUCCEEDED"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {enrollment.payment.status}
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">No payment</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {enrollment.payment?.coupon ? (
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{enrollment.payment.coupon.code}</div>
                          <div className="text-xs text-muted-foreground">
                            {enrollment.payment.coupon.discountType === "PERCENTAGE"
                              ? `${enrollment.payment.coupon.discountValue}% off`
                              : `${formatPrice(enrollment.payment.coupon.discountValue)} off`}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {formatDate(enrollment.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(enrollment.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Enrollment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the student&apos;s access to the course. They will need to
              purchase or re-enroll to regain access. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Removing..." : "Remove Enrollment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
