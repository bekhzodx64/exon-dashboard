import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: session.user.id, isRead: false },
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error("FETCH NOTIFICATIONS ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Global Admin can broadcast to everyone
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "global_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, message, type, link } = await req.json();
    
    // Get all users
    const users = await prisma.user.findMany({ select: { id: true } });
    
    // Create notifications for all
    const notifications = await prisma.notification.createMany({
      data: users.map(user => ({
        userId: user.id,
        title,
        message,
        type: type || "info",
        link,
      })),
    });

    return NextResponse.json({ success: true, count: users.length });
  } catch (error) {
    console.error("BROADCAST NOTIFICATION ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await prisma.notification.updateMany({
      where: { 
        userId: session.user.id,
        isRead: false 
      },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("MARK ALL READ ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
