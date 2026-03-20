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
    await prisma.knowledgeItem.delete({
      where: { id }
    });
    return NextResponse.json({ message: "Item deleted" });
  } catch (error) {
    console.error("DELETE ITEM ERROR:", error);
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
    const { title, content, order } = await req.json();

    const item = await prisma.knowledgeItem.update({
      where: { id },
      data: { 
        title, 
        content,
        order: order !== undefined ? order : undefined
      }
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("PATCH ITEM ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

