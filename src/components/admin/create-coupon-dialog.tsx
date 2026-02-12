"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { createCoupon } from "@/lib/actions/coupons";
import { toast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

const couponSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters").max(20).toUpperCase(),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().min(0, "Discount must be positive"),
  maxUses: z.union([z.number().positive("Must be greater than 0"), z.nan()]).optional().transform(val => isNaN(val as number) ? undefined : val),
  maxUsesPerUser: z.union([z.number().positive("Must be greater than 0"), z.nan()]).optional().transform(val => isNaN(val as number) ? undefined : val),
  minPurchaseAmount: z.union([z.number().min(0), z.nan()]).optional().transform(val => isNaN(val as number) ? undefined : val),
  validFrom: z.string(),
  validUntil: z.string().optional(),
  courseIds: z.array(z.string()).optional(),
});

type CouponFormData = z.infer<typeof couponSchema>;

interface CreateCouponDialogProps {
  courses: Array<{ id: string; title: string }>;
}

export function CreateCouponDialog({ courses }: CreateCouponDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      discountType: "PERCENTAGE",
      validFrom: new Date().toISOString().split("T")[0],
    },
  });

  const discountType = watch("discountType");

  const onSubmit = async (data: CouponFormData) => {
    setLoading(true);
    try {
      // Schema already handles NaN -> undefined transformation
      const cleanedData = {
        ...data,
        code: data.code.toUpperCase(),
        validFrom: new Date(data.validFrom),
        validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
        courseIds: selectedCourses.length > 0 ? selectedCourses : undefined,
      };
      
      const result = await createCoupon(cleanedData);

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Coupon created successfully",
        });
        setOpen(false);
        reset();
        setSelectedCourses([]);
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to create coupon",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleCourse = (courseId: string) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Coupon
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Coupon</DialogTitle>
          <DialogDescription>
            Set up a new discount coupon for your courses
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Coupon Code */}
            <div className="space-y-2">
              <Label htmlFor="code">Coupon Code *</Label>
              <Input
                id="code"
                placeholder="e.g., SUMMER2024"
                {...register("code")}
                className="uppercase"
              />
              {errors.code && (
                <p className="text-sm text-destructive">{errors.code.message}</p>
              )}
            </div>

            {/* Discount Type */}
            <div className="space-y-2">
              <Label htmlFor="discountType">Discount Type *</Label>
              <Select
                onValueChange={(value) =>
                  setValue("discountType", value as "PERCENTAGE" | "FIXED")
                }
                defaultValue="PERCENTAGE"
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                  <SelectItem value="FIXED">Fixed Amount ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Discount Value */}
            <div className="space-y-2">
              <Label htmlFor="discountValue">
                Discount Value * {discountType === "PERCENTAGE" ? "(%)" : "($)"}
              </Label>
              <Input
                id="discountValue"
                type="number"
                step={discountType === "PERCENTAGE" ? "1" : "0.01"}
                placeholder={discountType === "PERCENTAGE" ? "e.g., 20" : "e.g., 10.00"}
                {...register("discountValue", { valueAsNumber: true })}
              />
              {errors.discountValue && (
                <p className="text-sm text-destructive">
                  {errors.discountValue.message}
                </p>
              )}
            </div>

            {/* Min Purchase Amount */}
            <div className="space-y-2">
              <Label htmlFor="minPurchaseAmount">Min Purchase ($)</Label>
              <Input
                id="minPurchaseAmount"
                type="number"
                step="0.01"
                placeholder="Optional"
                {...register("minPurchaseAmount", { valueAsNumber: true })}
              />
            </div>

            {/* Max Uses */}
            <div className="space-y-2">
              <Label htmlFor="maxUses">Max Total Uses (leave empty for unlimited)</Label>
              <Input
                id="maxUses"
                type="number"
                placeholder="Leave empty for unlimited"
                {...register("maxUses", { valueAsNumber: true })}
              />
            </div>

            {/* Max Uses Per User */}
            <div className="space-y-2">
              <Label htmlFor="maxUsesPerUser">Max Uses Per User (leave empty for unlimited)</Label>
              <Input
                id="maxUsesPerUser"
                type="number"
                placeholder="Leave empty for unlimited"
                {...register("maxUsesPerUser", { valueAsNumber: true })}
              />
            </div>

            {/* Valid From */}
            <div className="space-y-2">
              <Label htmlFor="validFrom">Valid From *</Label>
              <Input
                id="validFrom"
                type="date"
                {...register("validFrom")}
              />
              {errors.validFrom && (
                <p className="text-sm text-destructive">
                  {errors.validFrom.message}
                </p>
              )}
            </div>

            {/* Valid Until */}
            <div className="space-y-2">
              <Label htmlFor="validUntil">Valid Until</Label>
              <Input
                id="validUntil"
                type="date"
                placeholder="No expiry"
                {...register("validUntil")}
              />
            </div>
          </div>

          {/* Course Selection */}
          <div className="space-y-2">
            <Label>Apply to Courses (leave empty for all courses)</Label>
            <div className="border rounded-md p-4 max-h-48 overflow-y-auto space-y-2">
              {courses.map((course) => (
                <div key={course.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={course.id}
                    checked={selectedCourses.includes(course.id)}
                    onCheckedChange={() => toggleCourse(course.id)}
                  />
                  <label
                    htmlFor={course.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {course.title}
                  </label>
                </div>
              ))}
              {courses.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No courses available
                </p>
              )}
            </div>
            {selectedCourses.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {selectedCourses.length} course(s) selected
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Coupon
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
