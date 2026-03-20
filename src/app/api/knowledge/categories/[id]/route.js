import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "global_admin" && session.user.role !== "admin")) {
    return false;
  }
  return session;
}

export async function DELETE(req, { params }) {
  const session = await checkAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    
    // Check if category has modules
    const category = await prisma.knowledgeCategory.findUnique({
      where: { id },
      include: { _count: { select: { modules: true } } }
    });

    if (category?._count?.modules > 0) {
      return NextResponse.json({ error: "Cannot delete category with existing modules" }, { status: 400 });
    }

    await prisma.knowledgeCategory.delete({
      where: { id }
    });
    return NextResponse.json({ message: "Category deleted" });
  } catch (error) {
    console.error("DELETE CATEGORY ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
