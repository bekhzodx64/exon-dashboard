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

    // Check if module has items
    const module = await prisma.knowledgeModule.findUnique({
      where: { id },
      include: { _count: { select: { items: true } } }
    });

    if (module?._count?.items > 0) {
      return NextResponse.json({ error: "Cannot delete module with existing items" }, { status: 400 });
    }

    await prisma.knowledgeModule.delete({
      where: { id }
    });
    return NextResponse.json({ message: "Module deleted" });
  } catch (error) {
    console.error("DELETE MODULE ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  const session = await checkAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { title, description } = await req.json();

    const module = await prisma.knowledgeModule.update({
      where: { id },
      data: { 
        title, 
        description: description || undefined 
      }
    });

    return NextResponse.json(module);
  } catch (error) {
    console.error("PATCH MODULE ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

