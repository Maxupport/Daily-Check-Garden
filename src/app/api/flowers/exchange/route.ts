import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/flowers/exchange - Exchange Red/Purple flowers for Yellow flowers
export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "未登入" }, { status: 401 });

  const { type, amount } = await req.json(); // type: "RED" | "PURPLE", amount: number
  if (!type || !amount || amount <= 0) return NextResponse.json({ error: "參數錯誤" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "找不到使用者" }, { status: 404 });

  // Fetch exchange rates
  const settings = await prisma.systemSetting.findMany({
    where: {
      key: {
        in: ["EXCHANGE_RATE_RED_TO_YELLOW", "EXCHANGE_RATE_PURPLE_TO_YELLOW"],
      },
    },
  });

  let rate = type === "RED" ? 2 : 5; // Fallback defaults
  settings.forEach((s) => {
    if (type === "RED" && s.key === "EXCHANGE_RATE_RED_TO_YELLOW") rate = parseInt(s.value, 10);
    if (type === "PURPLE" && s.key === "EXCHANGE_RATE_PURPLE_TO_YELLOW") rate = parseInt(s.value, 10);
  });

  const yellowEarned = amount * rate;

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Verify and deduct source flowers (atomic lock)
      if (type === "RED") {
        const checkUser = await tx.user.findUnique({ where: { id: userId } });
        if (!checkUser || checkUser.redFlowers < amount) throw new Error("紅花餘額不足");
        
        await tx.user.update({
          where: { id: userId, redFlowers: { gte: amount } },
          data: { redFlowers: { decrement: amount }, yellowFlowers: { increment: yellowEarned } },
        });

        await tx.flowerTransaction.create({
          data: {
            senderId: userId,
            receiverId: userId,
            amount: amount,
            type: "EXCHANGE_RED_TO_YELLOW",
          },
        });
      } else if (type === "PURPLE") {
        const checkUser = await tx.user.findUnique({ where: { id: userId } });
        if (!checkUser || checkUser.purpleFlowers < amount) throw new Error("紫花餘額不足");
        
        await tx.user.update({
          where: { id: userId, purpleFlowers: { gte: amount } },
          data: { purpleFlowers: { decrement: amount }, yellowFlowers: { increment: yellowEarned } },
        });

        await tx.flowerTransaction.create({
          data: {
            senderId: userId,
            receiverId: userId,
            amount: amount,
            type: "EXCHANGE_PURPLE_TO_YELLOW",
          },
        });
      } else {
        throw new Error("未知的花朵類型");
      }
    });

    return NextResponse.json({ success: true, yellowEarned });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
