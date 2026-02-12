"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireAdmin } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { slugify } from "@/lib/utils";
import { CourseLevel, CourseStatus } from "@prisma/client";

const sectionSchema = z.object({
  title: z.string().min(1, "Section title is required"),
  description: z.string().optional(),
  order: z.number(),
});

const courseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  shortDescription: z.string().optional(),
  categoryId: z.string().optional(),
  price: z.number().min(0),
  discountPrice: z.number().min(0).optional(),
  level: z.nativeEnum(CourseLevel),
  language: z.string().default("English"),
  thumbnail: z.string().optional(),
  previewVideo: z.string().optional(),
  learningOutcomes: z.array(z.string()),
  requirements: z.array(z.string()),
  instructorName: z.string(),
  instructorBio: z.string().optional(),
  instructorImage: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.array(z.string()).optional(),
  sections: z.array(sectionSchema).optional(),
});

export async function createCourse(data: z.infer<typeof courseSchema>) {
  try {
    await requireAdmin();
    
    // Validate with better error handling
    const validationResult = courseSchema.safeParse(data);
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { error: `Validation failed: ${errors}` };
    }
    
    const validated = validationResult.data;
    const slug = slugify(validated.title);

    // Get a default category if not provided
    let categoryId = validated.categoryId;
    if (!categoryId) {
      const defaultCategory = await prisma.category.findFirst({
        orderBy: { createdAt: 'asc' }
      });
      if (!defaultCategory) {
        return { error: "No categories found. Please create a category first." };
      }
      categoryId = defaultCategory.id;
    }

    const { sections, ...courseData } = validated;

    const course = await prisma.course.create({
      data: {
        ...courseData,
        categoryId,
        slug,
        status: CourseStatus.DRAFT,
        ...(sections && sections.length > 0 && {
          sections: {
            create: sections.map((section) => ({
              title: section.title,
              description: section.description || "",
              order: section.order,
            })),
          },
        }),
      },
      include: {
        sections: true,
      },
    });

    revalidatePath("/admin-dashboard-secret/courses");
    return { success: true, course };
  } catch (error) {
    console.error("Create course error:", error);
    return { error: "Failed to create course" };
  }
}

export async function updateCourse(courseId: string, data: Partial<z.infer<typeof courseSchema>>) {
  try {
    await requireAdmin();

    // Separate sections from other data (sections need to be handled separately)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { sections, ...courseData } = data;

    const course = await prisma.course.update({
      where: { id: courseId },
      data: {
        ...courseData,
        ...(data.title && { slug: slugify(data.title) }),
      },
    });

    revalidatePath("/admin-dashboard-secret/courses");
    revalidatePath(`/courses/${course.slug}`);
    return { success: true, course };
  } catch (error) {
    console.error("Update course error:", error);
    return { error: "Failed to update course" };
  }
}

export async function deleteCourse(courseId: string) {
  try {
    await requireAdmin();

    await prisma.course.delete({
      where: { id: courseId },
    });

    revalidatePath("/admin-dashboard-secret/courses");
    return { success: true };
  } catch (error) {
    console.error("Delete course error:", error);
    return { error: "Failed to delete course" };
  }
}

export async function publishCourse(courseId: string) {
  try {
    await requireAdmin();

    const course = await prisma.course.update({
      where: { id: courseId },
      data: {
        status: CourseStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });

    revalidatePath("/admin-dashboard-secret/courses");
    revalidatePath("/courses");
    return { success: true, course };
  } catch (error) {
    console.error("Publish course error:", error);
    return { error: "Failed to publish course" };
  }
}

export async function enrollInCourse(courseId: string) {
  try {
    const user = await getCurrentUser();

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: user.id,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      return { error: "Already enrolled in this course" };
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: user.id,
        courseId,
      },
    });

    // Update student count
    await prisma.course.update({
      where: { id: courseId },
      data: {
        studentsCount: {
          increment: 1,
        },
      },
    });

    revalidatePath("/dashboard");
    revalidatePath(`/courses/${courseId}`);
    return { success: true, enrollment };
  } catch (error) {
    console.error("Enroll in course error:", error);
    return { error: "Failed to enroll in course" };
  }
}

export async function createLesson(sectionId: string, data: {
  title: string;
  description?: string;
  duration?: number;
  order: number;
}) {
  try {
    await requireAdmin();

    const lesson = await prisma.lesson.create({
      data: {
        sectionId,
        title: data.title,
        description: data.description,
        duration: data.duration || 0,
        order: data.order,
      },
    });

    revalidatePath("/admin-dashboard-secret/videos");
    return { success: true, lesson };
  } catch (error) {
    console.error("Create lesson error:", error);
    return { error: "Failed to create lesson" };
  }
}

export async function updateLessonProgress(lessonId: string, completed: boolean, lastPosition?: number) {
  try {
    const user = await getCurrentUser();

    const progress = await prisma.lessonProgress.upsert({
      where: {
        studentId_lessonId: {
          studentId: user.id,
          lessonId,
        },
      },
      update: {
        completed,
        ...(lastPosition !== undefined && { lastPosition }),
        updatedAt: new Date(),
      },
      create: {
        studentId: user.id,
        lessonId,
        completed,
        lastPosition: lastPosition || 0,
      },
    });

    // Update overall course progress
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        section: {
          include: {
            course: {
              include: {
                sections: {
                  include: {
                    lessons: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (lesson) {
      const courseId = lesson.section.courseId;
      const totalLessons = lesson.section.course.sections.reduce(
        (acc, section) => acc + section.lessons.length,
        0
      );

      const completedLessons = await prisma.lessonProgress.count({
        where: {
          studentId: user.id,
          completed: true,
          lesson: {
            section: {
              courseId,
            },
          },
        },
      });

      const progressPercentage = (completedLessons / totalLessons) * 100;

      await prisma.enrollment.update({
        where: {
          studentId_courseId: {
            studentId: user.id,
            courseId,
          },
        },
        data: {
          progress: progressPercentage,
          ...(progressPercentage === 100 && {
            completedAt: new Date(),
          }),
        },
      });
    }

    revalidatePath("/learn");
    return { success: true, progress };
  } catch (error) {
    console.error("Update lesson progress error:", error);
    return { error: "Failed to update progress" };
  }
}
