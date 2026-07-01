import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/settings - Fetch current exchange rates
export async function GET() {
  const settings = await prisma.systemSetting.findMany({
    where: {
      key: {
        in: ["EXCHANGE_RATE_RED_TO_YELLOW", "EXCHANGE_RATE_PURPLE_TO_YELLOW"],
      },
    },
  });

  // Default values if not set
  let redRate = 2;
  let purpleRate = 5;

  settings.forEach((s) => {
    if (s.key === "EXCHANGE_RATE_RED_TO_YELLOW") redRate = parseInt(s.value, 10);
    if (s.key === "EXCHANGE_RATE_PURPLE_TO_YELLOW") purpleRate = parseInt(s.value, 10);
  });

  return NextResponse.json({ redRate, purpleRate });
}

// POST /api/settings - Update exchange rates (ADMIN only)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登入" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "ADMIN") return NextResponse.json({ error: "權限不足" }, { status: 403 });

  const { redRate, purpleRate } = await req.json();

  if (typeof redRate !== "number" || typeof purpleRate !== "number" || redRate < 1 || purpleRate < 1) {
    return NextResponse.json({ error: "匯率必須是大於等於 1 的整數" }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.systemSetting.upsert({
      where: { key: "EXCHANGE_RATE_RED_TO_YELLOW" },
      update: { value: redRate.toString() },
      create: { key: "EXCHANGE_RATE_RED_TO_YELLOW", value: redRate.toString() },
    }),
    prisma.systemSetting.upsert({
      where: { key: "EXCHANGE_RATE_PURPLE_TO_YELLOW" },
      update: { value: purpleRate.toString() },
      create: { key: "EXCHANGE_RATE_PURPLE_TO_YELLOW", value: purpleRate.toString() },
    }),
  ]);

  return NextResponse.json({ success: true, redRate, purpleRate });
}
