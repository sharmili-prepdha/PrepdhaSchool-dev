import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const schools = await prisma.school.findMany({
    select: {
      id: true,
      name: true,
      keyword: true,
      is_active: true,
      created_at: true,
    },
    orderBy: { created_at: "desc" },
  });

  return NextResponse.json(schools);
}

export async function POST(req: NextRequest) {
  const { keyword, name } = await req.json();

  const school = await prisma.school.create({
    data: { keyword, name },
  });

  return NextResponse.json(school, { status: 201 });
}

// ✅ ADD THIS PUT METHOD
export async function PUT(req: NextRequest) {
  try {
    const { id, keyword, name } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "School ID is required" }, { status: 400 });
    }

    const schoolId = parseInt(id);
    if (isNaN(schoolId)) {
      return NextResponse.json({ error: "Invalid school ID" }, { status: 400 });
    }

    const updatedSchool = await prisma.school.update({
      where: { id: schoolId },
      data: {
        keyword,
        name,
      },
    });

    return NextResponse.json(updatedSchool);
  } catch (error) {
    return NextResponse.json(
      { error: `School not found or update failed ${error}` },
      { status: 500 },
    );
  }
}
