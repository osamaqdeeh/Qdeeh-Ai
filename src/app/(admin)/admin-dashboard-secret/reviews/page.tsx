import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, CheckCircle, XCircle } from "lucide-react";

export default async function AdminReviewsPage() {
  await requireAdmin();

  const reviews = await prisma.review.findMany({
    include: {
      student: true,
      course: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const stats = {
    total: reviews.length,
    approved: reviews.filter((r) => r.approved).length,
    pending: reviews.filter((r) => !r.approved).length,
    avgRating:
      reviews.length > 0
        ? (
            reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          ).toFixed(1)
        : "0",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reviews Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage and moderate course reviews
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Total Reviews</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Approved</div>
          <div className="text-2xl font-bold text-green-600">
            {stats.approved}
          </div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Pending</div>
          <div className="text-2xl font-bold text-orange-600">
            {stats.pending}
          </div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Average Rating</div>
          <div className="text-2xl font-bold flex items-center gap-1">
            {stats.avgRating}
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((review) => (
              <TableRow key={review.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={review.student.image || ""} />
                      <AvatarFallback>
                        {review.student.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{review.student.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {review.student.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-xs truncate">{review.course.title}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-md truncate text-sm">
                    {review.comment || "No comment"}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge variant={review.approved ? "default" : "secondary"}>
                    {review.approved ? "Approved" : "Pending"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {!review.approved && (
                      <Button size="sm" variant="outline">
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
