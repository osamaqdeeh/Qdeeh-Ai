"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createCourse, updateCourse } from "@/lib/actions/courses";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, Trash2 } from "lucide-react";
import type { Course } from "@prisma/client";

interface Section {
  title: string;
  description: string;
  order: number;
}

interface CreateCourseFormProps {
  categories?: Array<{ id: string; name: string }>;
  course?: Course & {
    sections: Array<{
      id: string;
      title: string;
      description: string;
      order: number;
    }>;
  };
}

export function CreateCourseForm({ course }: CreateCourseFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!course;
  const [sections, setSections] = useState<Section[]>(
    course?.sections?.length 
      ? course.sections.map(s => ({ title: s.title, description: s.description || "", order: s.order }))
      : [{ title: "", description: "", order: 0 }]
  );

  const addSection = () => {
    setSections([...sections, { title: "", description: "", order: sections.length }]);
  };

  const removeSection = (index: number) => {
    if (sections.length > 1) {
      setSections(sections.filter((_, i) => i !== index));
    }
  };

  const updateSection = (index: number, field: keyof Section, value: string | number) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], [field]: value };
    setSections(newSections);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);

      // Validate sections
      const validSections = sections.filter(s => s.title.trim() !== "");
      if (validSections.length === 0) {
        toast({
          title: "Error",
          description: "Please add at least one section with a title.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Parse learning outcomes and requirements from comma-separated values
      const learningOutcomes = (formData.get("learning-outcomes") as string)
        ?.split(",")
        .map((s) => s.trim())
        .filter(Boolean) || [];
      
      const requirements = (formData.get("requirements") as string)
        ?.split(",")
        .map((s) => s.trim())
        .filter(Boolean) || [];

      const data = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        shortDescription: formData.get("short-description") as string || undefined,
        price: parseFloat(formData.get("price") as string),
        discountPrice: formData.get("discount-price") 
          ? parseFloat(formData.get("discount-price") as string)
          : undefined,
        level: formData.get("level") as "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL_LEVELS",
        language: (formData.get("language") as string) || "English",
        thumbnail: formData.get("thumbnail") as string || undefined,
        previewVideo: formData.get("preview-video") as string || undefined,
        learningOutcomes,
        requirements,
        instructorName: formData.get("instructor-name") as string,
        instructorBio: formData.get("instructor-bio") as string || undefined,
        instructorImage: formData.get("instructor-image") as string || undefined,
        sections: validSections.map((s, idx) => ({ ...s, order: idx })),
      };

      const result = isEditing 
        ? await updateCourse(course.id, data)
        : await createCourse(data);

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: isEditing ? "Course updated successfully!" : "Course created successfully!",
        });
        router.push("/admin-dashboard-secret/courses");
        router.refresh();
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to create course. Please check all required fields.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Enter the basic details about the course
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Course Title *</Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter course title"
              defaultValue={course?.title}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="short-description">Short Description</Label>
            <Input
              id="short-description"
              name="short-description"
              placeholder="Brief description for cards"
              defaultValue={course?.shortDescription || ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Full Description *</Label>
            <textarea
              id="description"
              name="description"
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Detailed course description (at least 10 characters)"
              defaultValue={course?.description}
              required
              minLength={10}
            />
            <p className="text-sm text-muted-foreground">
              Minimum 10 characters required
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
          <CardDescription>
            Configure pricing and level
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (USD) *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                placeholder="99.99"
                defaultValue={course?.price}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount-price">Discount Price</Label>
              <Input
                id="discount-price"
                name="discount-price"
                type="number"
                step="0.01"
                placeholder="79.99"
                defaultValue={course?.discountPrice || ""}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">Course Level *</Label>
            <Select name="level" defaultValue={course?.level} required>
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BEGINNER">Beginner</SelectItem>
                <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                <SelectItem value="ADVANCED">Advanced</SelectItem>
                <SelectItem value="ALL_LEVELS">All Levels</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Input
              id="language"
              name="language"
              defaultValue={course?.language || "English"}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Course Sections</CardTitle>
          <CardDescription>
            Add sections to organize your course content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sections.map((section, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Section {index + 1}</h4>
                {sections.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSection(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`section-title-${index}`}>Section Title *</Label>
                <Input
                  id={`section-title-${index}`}
                  value={section.title}
                  onChange={(e) => updateSection(index, 'title', e.target.value)}
                  placeholder="e.g., Introduction to the Course"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`section-description-${index}`}>Section Description</Label>
                <textarea
                  id={`section-description-${index}`}
                  value={section.description}
                  onChange={(e) => updateSection(index, 'description', e.target.value)}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Brief description of this section"
                />
              </div>
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            onClick={addSection}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Section
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Learning Outcomes & Requirements</CardTitle>
          <CardDescription>
            What students will learn and what they need to know
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="learning-outcomes">Learning Outcomes</Label>
            <textarea
              id="learning-outcomes"
              name="learning-outcomes"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Enter learning outcomes separated by commas"
              defaultValue={course?.learningOutcomes?.join(", ") || ""}
            />
            <p className="text-sm text-muted-foreground">
              Separate multiple outcomes with commas
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements</Label>
            <textarea
              id="requirements"
              name="requirements"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Enter requirements separated by commas"
              defaultValue={course?.requirements?.join(", ") || ""}
            />
            <p className="text-sm text-muted-foreground">
              Separate multiple requirements with commas
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Instructor Information</CardTitle>
          <CardDescription>
            Information about the course instructor
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="instructor-name">Instructor Name *</Label>
            <Input
              id="instructor-name"
              name="instructor-name"
              placeholder="John Doe"
              defaultValue={course?.instructorName}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructor-bio">Instructor Bio</Label>
            <textarea
              id="instructor-bio"
              name="instructor-bio"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Brief bio about the instructor"
              defaultValue={course?.instructorBio || ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructor-image">Instructor Image URL</Label>
            <Input
              id="instructor-image"
              name="instructor-image"
              type="url"
              placeholder="https://example.com/image.jpg"
              defaultValue={course?.instructorImage || ""}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Media</CardTitle>
          <CardDescription>
            Course thumbnail and preview video
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="thumbnail">Thumbnail URL</Label>
            <Input
              id="thumbnail"
              name="thumbnail"
              type="url"
              placeholder="https://example.com/thumbnail.jpg"
              defaultValue={course?.thumbnail || ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preview-video">Preview Video URL</Label>
            <Input
              id="preview-video"
              name="preview-video"
              type="url"
              placeholder="https://example.com/preview.mp4"
              defaultValue={course?.previewVideo || ""}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting 
            ? (isEditing ? "Updating..." : "Creating...") 
            : (isEditing ? "Update Course" : "Create Course")}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.push("/admin-dashboard-secret/courses")}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
