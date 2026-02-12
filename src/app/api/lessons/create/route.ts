import { NextRequest, NextResponse } from "next/server";
import { createLesson } from "@/lib/actions/courses";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sectionId, title, order } = body;

    if (!sectionId || !title) {
      return NextResponse.json(
        { error: "Section ID and title are required" },
        { status: 400 }
      );
    }

    const result = await createLesson(sectionId, {
      title,
      order: order || 0,
    });

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result.lesson);
  } catch (error) {
    console.error("Create lesson API error:", error);
    return NextResponse.json(
      { error: "Failed to create lesson" },
      { status: 500 }
    );
  }
}
