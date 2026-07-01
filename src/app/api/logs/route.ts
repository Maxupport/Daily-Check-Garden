import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/logs - Daily check-in
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登入" }, { status: 401 });

  const { questId, text } = await req.json();
  if (!questId || !text) return NextResponse.json({ error: "缺少欄位" }, { status: 400 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Check already logged in today
  const existing = await prisma.dailyLog.findFirst({
    where: {
      questId,
      userId: session.user.id,
      createdAt: { gte: today, lt: tomorrow },
    },
  });

  if (existing) {
    return NextResponse.json({ error: "今日已打卡過囉！" }, { status: 409 });
  }

  const quest = await prisma.quest.findFirst({
    where: { id: questId, userId: session.user.id },
    include: { wishPool: true },
  });

  if (!quest) return NextResponse.json({ error: "找不到專案" }, { status: 404 });

  const newStreak = quest.currentStreak + 1;
  const isComplete = newStreak >= quest.totalTargetDays;

  // Create log + update streak in a transaction
  const [log] = await prisma.$transaction([
    prisma.dailyLog.create({
      data: { text, questId, userId: session.user.id },
    }),
    prisma.quest.update({
      where: { id: questId },
      data: {
        currentStreak: newStreak,
        isCompleted: isComplete,
      },
    }),
    // Give user +1 yellow flower for checking in
    prisma.user.update({
      where: { id: session.user.id },
      data: { yellowFlowers: { increment: 1 } },
    }),
  ]);

  // If goal achieved, convert wish pool pledges to purple flowers
  if (isComplete && quest.wishPool && !quest.wishPool.isCompleted) {
    await prisma.$transaction([
      prisma.wishPool.update({
        where: { id: quest.wishPool.id },
        data: { isCompleted: true },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: { purpleFlowers: { increment: quest.wishPool.currentFlowers } },
      }),
    ]);
  }

  return NextResponse.json({ log, newStreak, isComplete }, { status: 201 });
}
