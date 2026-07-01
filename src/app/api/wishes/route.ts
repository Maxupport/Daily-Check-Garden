import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/wishes - Get all public wish pools with progress
export async function GET() {
  const wishes = await prisma.wishPool.findMany({
    where: { isCompleted: false, quest: { isPublic: true } },
    include: {
      quest: {
        select: {
          title: true,
          user: { select: { id: true, name: true, image: true, bio: true } },
        },
      },
      _count: { select: { pledges: true } },
    },
    orderBy: { currentFlowers: "desc" },
  });

  return NextResponse.json(wishes);
}

// POST /api/wishes - Pledge a yellow flower into a wish pool
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登入" }, { status: 401 });

  const { wishPoolId } = await req.json();
  if (!wishPoolId) return NextResponse.json({ error: "缺少許願池 ID" }, { status: 400 });

  const sender = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!sender || sender.yellowFlowers <= 0) {
    return NextResponse.json({ error: "你今日的橘花已用完" }, { status: 400 });
  }

  const wishPool = await prisma.wishPool.findUnique({
    where: { id: wishPoolId },
    include: { quest: true },
  });

  if (!wishPool || wishPool.isCompleted) {
    return NextResponse.json({ error: "許願池不存在或已完成" }, { status: 404 });
  }

  const newTotal = wishPool.currentFlowers + 1;
  const isNowComplete = newTotal >= wishPool.targetFlowers;

  await prisma.$transaction([
    // Deduct sender's yellow flower
    prisma.user.update({
      where: { id: session.user.id, yellowFlowers: { gt: 0 } },
      data: { yellowFlowers: { decrement: 1 } },
    }),
    // Add to wish pool
    prisma.wishPool.update({
      where: { id: wishPoolId },
      data: {
        currentFlowers: { increment: 1 },
        isCompleted: isNowComplete,
      },
    }),
    // Log the pledge
    prisma.wishPledge.create({
      data: {
        wishPoolId,
        pledgerId: session.user.id,
      },
    }),
    // Log the flower transaction
    prisma.flowerTransaction.create({
      data: {
        senderId: session.user.id,
        receiverId: wishPool.quest.userId,
        type: "YELLOW_TO_WISH",
      },
    }),
  ]);

  // If pool just completed, give purple flowers to quest owner
  if (isNowComplete) {
    await prisma.user.update({
      where: { id: wishPool.quest.userId },
      data: { 
        purpleFlowers: { increment: wishPool.targetFlowers },
        lifetimePurpleFlowers: { increment: wishPool.targetFlowers }
      },
    });
  }

  return NextResponse.json({ success: true, isNowComplete });
}
