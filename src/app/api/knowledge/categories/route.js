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

export async function GET() {
  try {
    const categories = await prisma.knowledgeCategory.findMany({
      include: {
        modules: {
          include: {
            items: {
              select: { id: true, title: true, content: true, order: true }
            }
          }
        }
      },
      orderBy: { name: "asc" }
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("GET KNOWLEDGE ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  const session = await checkAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, icon } = await req.json();
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const category = await prisma.knowledgeCategory.create({
      data: { name, icon: icon || "BookOpen" }
    });
    return NextResponse.json(category);
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Category already exists" }, { status: 400 });
    }
    console.error("CREATE KNOWLEDGE CATEGORY ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
