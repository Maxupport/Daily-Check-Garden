import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "缺少必填欄位" }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ error: "密碼長度必須至少 6 個字元" }, { status: 400 });
    }

    if (name) {
      if (name.toLowerCase() === "yuo1238" && email.toLowerCase() !== "maxupport@gmail.com") {
        return NextResponse.json({ error: "此暱稱已有使用者使用，請選擇其他的暱稱" }, { status: 400 });
      }

      const existingName = await prisma.user.findFirst({
        where: { name: { equals: name, mode: 'insensitive' } }
      });

      if (existingName) {
        return NextResponse.json({ error: "此暱稱已有使用者使用，請選擇其他的暱稱" }, { status: 400 });
      }
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "此 Email 已被使用" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user + linked credentials account
    const user = await prisma.user.create({
      data: {
        name,
        email,
        hasClaimedToday: false,
        accounts: {
          create: {
            type: "credentials",
            provider: "credentials",
            providerAccountId: email,
            refresh_token: hashedPassword, // Store hashed pw in refresh_token field
          },
        },
      },
    });

    return NextResponse.json({ id: user.id, email: user.email, name: user.name }, { status: 201 });
  } catch (error) {
    console.error("[register] error:", error);
    return NextResponse.json({ error: "伺服器錯誤，請稍後再試" }, { status: 500 });
  }
}
