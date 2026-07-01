import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Middleware: check admin role
async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "ADMIN") return null;
  return user;
}

// GET /api/admin/stats - Dashboard stats
export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "無權限" }, { status: 403 });

  const url = new URL(req.url);
  const type = url.searchParams.get("type") || "stats";

  if (type === "stats") {
    const [totalUsers, totalQuests, totalLogs, totalFlowers] = await Promise.all([
      prisma.user.count(),
      prisma.quest.count(),
      prisma.dailyLog.count(),
      prisma.flowerTransaction.count(),
    ]);

    const activeQuests = await prisma.quest.count({ where: { isCompleted: false } });
    const completedWishes = await prisma.wishPool.count({ where: { isCompleted: true } });

    return NextResponse.json({
      totalUsers,
      totalQuests,
      activeQuests,
      totalLogs,
      totalFlowers,
      completedWishes,
    });
  }

  if (type === "users") {
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = 20;
    const users = await prisma.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        yellowFlowers: true,
        redFlowers: true,
        purpleFlowers: true,
        isActive: true,
        createdAt: true,
        _count: { select: { quests: true, logsAuthored: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users);
  }

  return NextResponse.json({ error: "未知的查詢類型" }, { status: 400 });
}

// PATCH /api/admin/stats - Admin actions (e.g. change daily quota, update user role)
export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "無權限" }, { status: 403 });

  const { action, userId, role } = await req.json();

  if (action === "setRole" && userId && role) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });
    return NextResponse.json({ id: updated.id, role: updated.role });
  }

  if (action === "DISABLE" && userId) {
    if (userId === admin.id) return NextResponse.json({ error: "不能停用自己" }, { status: 400 });
    const updated = await prisma.user.update({ where: { id: userId }, data: { isActive: false } });
    return NextResponse.json({ id: updated.id, isActive: updated.isActive });
  }

  if (action === "ENABLE" && userId) {
    const updated = await prisma.user.update({ where: { id: userId }, data: { isActive: true } });
    return NextResponse.json({ id: updated.id, isActive: updated.isActive });
  }

  if (action === "DELETE" && userId) {
    if (userId === admin.id) return NextResponse.json({ error: "不能刪除自己" }, { status: 400 });
    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ success: true, deletedId: userId });
  }

  return NextResponse.json({ error: "未知操作" }, { status: 400 });
}
