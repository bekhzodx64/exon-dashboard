import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

// Auth check middleware-like function
async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "global_admin" && session.user.role !== "admin")) {
    return false;
  }
  return session;
}

export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { name, email, role, password, brandColor } = await req.json();

    // 1. Fetch target user to check their current role
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true }
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Enforce Edit Permissions:
    // - global_admin can edit anyone
    // - admin can edit themselves
    // - admin can edit employee
    // - admin CANNOT edit other admins or global_admins
    const isSelf = targetUser.id === session.user.id;
    const isGlobalAdmin = session.user.role === "global_admin";
    const isAdminEditingEmployee = session.user.role === "admin" && targetUser.role === "employee";

    if (!isGlobalAdmin && !isSelf && !isAdminEditingEmployee) {
        return NextResponse.json({ 
            error: "Insufficient permissions. You can only edit yourself or employee accounts." 
        }, { status: 403 });
    }

    // 3. Security: Role switching restrictions
    // - Only the existing Global Admin can keep the Global Admin role.
    // - No one can elevate a regular user/admin to the Global Admin role via API.
    if (role === "global_admin" && targetUser.role !== "global_admin") {
      return NextResponse.json({ error: "Cannot elevate users to Global Admin. This role is unique and restricted." }, { status: 403 });
    }

    // - No user (admin or global_admin) can change their OWN role
    if (isSelf && role !== targetUser.role) {
      return NextResponse.json({ error: "You cannot change your own role. Contact another administrator if necessary." }, { status: 403 });
    }

    // - Regular admin cannot promote anyone to Admin (only global_admin can)
    if (session.user.role === "admin" && role === "admin" && targetUser.role !== "admin") {
      return NextResponse.json({ error: "Insufficient permissions. Only Global Admin can promote users to Admin role." }, { status: 403 });
    }

    const data = {
      name,
      email,
      role,
      brandColor,
    };

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      brandColor: updatedUser.brandColor,
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Email already taken" }, { status: 400 });
    }
    console.error("UPDATE USER ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const session = await checkAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // 1. Block self-deletion
  if (id === session.user.id) {
    return NextResponse.json({ error: "Self-deletion not allowed" }, { status: 400 });
  }

  try {
    // 2. Fetch target user to check role
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { role: true }
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 3. Enforce Role Hierarchy
    // - global_admin can delete anyone (except self, checked above)
    // - admin can ONLY delete employee
    if (session.user.role === "admin" && targetUser.role !== "employee") {
        return NextResponse.json({ 
            error: "Admins can only delete employees. Global Admin privileges required to delete other admins." 
        }, { status: 403 });
    }

    // - If we want to strictly follow "can delete admin and employee" for global_admin:
    // Actually, usually global_admin can delete other global_admins too, but let's be safe.
    
    await prisma.user.delete({
      where: { id },
    });
    return NextResponse.json({ message: "User deleted" });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
