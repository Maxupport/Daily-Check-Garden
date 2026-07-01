import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/quests - Get current user's quest
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登入" }, { status: 401 });

  const quest = await prisma.quest.findFirst({
    where: { userId: session.user.id, isCompleted: false },
    include: {
      logs: { orderBy: { createdAt: "desc" } },
      wishPool: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(quest);
}

// POST /api/quests - Create a new quest
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登入" }, { status: 401 });

  const { title, durationType, durationValue, totalTargetDays, wishTarget } = await req.json();

  if (!title || !totalTargetDays || totalTargetDays < 21) {
    return NextResponse.json({ error: "專案設定不符合最低要求" }, { status: 400 });
  }

  // Mark any existing quests as completed first
  await prisma.quest.updateMany({
    where: { userId: session.user.id, isCompleted: false },
    data: { isCompleted: true },
  });

  const quest = await prisma.quest.create({
    data: {
      title,
      durationType,
      durationValue,
      totalTargetDays,
      userId: session.user.id,
      wishPool: wishTarget
        ? { create: { targetFlowers: wishTarget } }
        : undefined,
    },
    include: { wishPool: true, logs: true },
  });

  return NextResponse.json(quest, { status: 201 });
}
