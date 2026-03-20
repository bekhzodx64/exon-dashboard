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
    const { title, description, categoryId } = await req.json();
    if (!title || !categoryId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const module = await prisma.knowledgeModule.create({
      data: { title, description, categoryId }
    });
    return NextResponse.json(module);
  } catch (error) {
    console.error("CREATE KNOWLEDGE MODULE ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
