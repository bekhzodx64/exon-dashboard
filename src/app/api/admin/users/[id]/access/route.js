import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);
  
  // Only global_admin or admin can modify access
  if (!session || !["global_admin", "admin"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { durationMinutes } = await req.json();

  try {
    let accessExpiresAt = null;
    
    if (durationMinutes && durationMinutes > 0) {
      accessExpiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { accessExpiresAt },
      select: {
          id: true,
          name: true,
          accessExpiresAt: true
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("UPDATE ACCESS ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
