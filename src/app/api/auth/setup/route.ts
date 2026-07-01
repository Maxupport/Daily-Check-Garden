import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "未登入" }, { status: 401 });
    }

    const { name, password } = await req.json();

    if (!password || password.length < 6) {
      return NextResponse.json({ error: "密碼格式無效" }, { status: 400 });
    }

    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json({ error: "使用者資訊錯誤" }, { status: 400 });
    }

    if (name) {
      if (name.toLowerCase() === "yuo1238" && session.user.email?.toLowerCase() !== "maxupport@gmail.com") {
        return NextResponse.json({ error: "此暱稱已有使用者使用，請選擇其他的暱稱" }, { status: 400 });
      }
      
      const existingName = await prisma.user.findFirst({
        where: { 
          name: { equals: name, mode: 'insensitive' },
          id: { not: userId } 
        }
      });

      if (existingName) {
        return NextResponse.json({ error: "此暱稱已有使用者使用，請選擇其他的暱稱" }, { status: 400 });
      }
    }

    // Check if user already has a credentials account
    const existingCreds = await prisma.account.findFirst({
      where: { userId, provider: "credentials" },
    });

    if (existingCreds) {
      return NextResponse.json({ error: "您已經設定過密碼了" }, { status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a credentials account for this user
    await prisma.account.create({
      data: {
        userId: userId,
        type: "credentials",
        provider: "credentials",
        providerAccountId: userId, // use userId as unique provider account ID for credentials
        refresh_token: hashedPassword, // Store hashed password here
      },
    });

    // Update user's name
    if (name) {
      await prisma.user.update({
        where: { id: userId },
        data: { name: name },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json({ error: "設定過程中發生錯誤" }, { status: 500 });
  }
}
