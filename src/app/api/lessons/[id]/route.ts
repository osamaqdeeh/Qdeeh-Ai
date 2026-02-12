import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * Update lesson (e.g., add video URL)
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();

    // Update lesson
    const lesson = await prisma.lesson.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({
      success: true,
      lesson,
    });
  } catch (error: any) {
    console.error("Update lesson error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update lesson" },
      { status: 500 }
    );
  }
}

/**
 * Get lesson details
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;

    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        section: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      lesson,
    });
  } catch (error: any) {
    console.error("Get lesson error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get lesson" },
      { status: 500 }
    );
  }
}

/**
 * Delete lesson
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;

    await prisma.lesson.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Lesson deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete lesson error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete lesson" },
      { status: 500 }
    );
  }
}
