import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/flowers - Send a yellow flower to someone (become red for them)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登入" }, { status: 401 });

  const { receiverId } = await req.json();
  if (!receiverId) return NextResponse.json({ error: "缺少接收者" }, { status: 400 });
  if (receiverId === session.user.id) return NextResponse.json({ error: "不能送花給自己" }, { status: 400 });

  const sender = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!sender || sender.yellowFlowers <= 0) {
    return NextResponse.json({ error: "你今日的橘花已用完" }, { status: 400 });
  }

  // Transaction: deduct sender yellow, add receiver red, log it
  await prisma.$transaction([
    prisma.user.update({
      where: { id: session.user.id, yellowFlowers: { gt: 0 } },
      data: { yellowFlowers: { decrement: 1 } },
    }),
    prisma.user.update({
      where: { id: receiverId },
      data: { 
        redFlowers: { increment: 1 },
        lifetimeRedFlowers: { increment: 1 }
      },
    }),
    prisma.flowerTransaction.create({
      data: {
        senderId: session.user.id,
        receiverId,
        type: "YELLOW_TO_RED",
      },
    }),
  ]);

  return NextResponse.json({ success: true });
}

// POST /api/flowers/claim-daily - Claim daily yellow flowers
export async function PUT() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登入" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "找不到使用者" }, { status: 404 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (user.hasClaimedToday && user.lastDailyReset && user.lastDailyReset >= today) {
    return NextResponse.json({ error: "今日已領取過橘花" }, { status: 409 });
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      yellowFlowers: 3,
      hasClaimedToday: true,
      lastDailyReset: new Date(),
    },
  });

  return NextResponse.json({ yellowFlowers: updated.yellowFlowers });
}
