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
import { Switch } from "@/components/ui/switch";
import { Trash2, Tag, Calendar, TrendingUp } from "lucide-react";
import { formatDate, formatPrice } from "@/lib/utils";
import { deleteCoupon, toggleCouponStatus } from "@/lib/actions/coupons";
import { toast } from "@/components/ui/use-toast";
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

interface Coupon {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  isActive: boolean;
  currentUses: number;
  maxUses: number | null;
  maxUsesPerUser: number | null;
  minPurchaseAmount: number | null;
  validFrom: Date;
  validUntil: Date | null;
  createdAt: Date;
  courses: Array<{
    courseId: string;
    course: {
      title: string;
    };
  }>;
}

interface CouponsTableProps {
  coupons: Coupon[];
}

export function CouponsTable({ coupons }: CouponsTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteCoupon(id);
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Coupon deleted successfully",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete coupon",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggle = async (id: string) => {
    setTogglingId(id);
    try {
      const result = await toggleCouponStatus(id);
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Coupon status updated",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to update coupon",
        variant: "destructive",
      });
    } finally {
      setTogglingId(null);
    }
  };

  if (coupons.length === 0) {
    return (
      <div className="text-center py-12">
        <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No coupons yet</h3>
        <p className="text-muted-foreground">
          Create your first coupon to start offering discounts
        </p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Discount</TableHead>
            <TableHead>Usage</TableHead>
            <TableHead>Valid Period</TableHead>
            <TableHead>Courses</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {coupons.map((coupon) => {
            const isExpired = coupon.validUntil && new Date(coupon.validUntil) < new Date();
            const isMaxedOut = coupon.maxUses && coupon.currentUses >= coupon.maxUses;
            
            return (
              <TableRow key={coupon.id}>
                <TableCell className="font-mono font-semibold">
                  {coupon.code}
                </TableCell>
                <TableCell>
                  {coupon.discountType === "PERCENTAGE" ? (
                    <span>{coupon.discountValue}% off</span>
                  ) : (
                    <span>{formatPrice(coupon.discountValue)} off</span>
                  )}
                  {coupon.minPurchaseAmount && (
                    <div className="text-xs text-muted-foreground">
                      Min: {formatPrice(coupon.minPurchaseAmount)}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {coupon.currentUses}
                      {coupon.maxUses && ` / ${coupon.maxUses}`}
                    </span>
                  </div>
                  {isMaxedOut && (
                    <Badge variant="secondary" className="mt-1">
                      Maxed Out
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div>{formatDate(coupon.validFrom)}</div>
                      {coupon.validUntil && (
                        <div className="text-muted-foreground">
                          to {formatDate(coupon.validUntil)}
                        </div>
                      )}
                    </div>
                  </div>
                  {isExpired && (
                    <Badge variant="destructive" className="mt-1">
                      Expired
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {coupon.courses.length === 0 ? (
                    <Badge variant="outline">All Courses</Badge>
                  ) : (
                    <div className="space-y-1">
                      {coupon.courses.slice(0, 2).map((c) => (
                        <Badge key={c.courseId} variant="secondary" className="block w-fit">
                          {c.course.title}
                        </Badge>
                      ))}
                      {coupon.courses.length > 2 && (
                        <Badge variant="outline">
                          +{coupon.courses.length - 2} more
                        </Badge>
                      )}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={coupon.isActive}
                    onCheckedChange={() => handleToggle(coupon.id)}
                    disabled={togglingId === coupon.id}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeletingId(coupon.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the coupon.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && handleDelete(deletingId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
