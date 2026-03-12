import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    logger.info("Health check passed");
    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (error) {
    logger.error(`Health check failed: ${error}`);
    return NextResponse.json(
      { status: "error", message: "Database connection failed" },
      { status: 500 },
    );
  }
}
