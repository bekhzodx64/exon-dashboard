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

export async function POST(req) {
  const session = await checkAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, content, moduleId, order } = await req.json();
    if (!title || !content || !moduleId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const item = await prisma.knowledgeItem.create({
      data: { 
        title, 
        content, 
        moduleId,
        order: order || 0
      }
    });
    return NextResponse.json(item);
  } catch (error) {
    console.error("CREATE KNOWLEDGE ITEM ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
