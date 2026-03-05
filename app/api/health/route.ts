import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma.server";

export async function GET() {
  const buildVersion = process.env.BUILD_VERSION;

  let database: "UP" | "DOWN";
  try {
    await prisma.$queryRaw`SELECT 1`;
    database = "UP";
  } catch {
    database = "DOWN";
  }

  return NextResponse.json({
    status: "UP",
    database,
    version: buildVersion ?? "unknown",
  });
}
