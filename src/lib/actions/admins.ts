"use server";

import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth-helpers";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

const SUPER_ADMIN_EMAIL = "qdeehai@gmail.com";

// Schema for creating admin
const createAdminSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(6),
  isSuperAdmin: z.boolean().default(false),
});

// Schema for updating admin
const updateAdminSchema = z.object({
  id: z.string(),
  name: z.string().min(2).optional(),
  isSuperAdmin: z.boolean().optional(),
});

/**
 * Get all admins (Super Admin only)
 */
export async function getAllAdmins() {
  try {
    await requireSuperAdmin();

    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        isSuperAdmin: true,
        createdAt: true,
        lastLoginAt: true,
        permissions: true,
        _count: {
          select: {
            activityLogs: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, admins };
  } catch (error) {
    console.error("Error fetching admins:", error);
    return { error: "Failed to fetch admins" };
  }
}

/**
 * Create a new admin (Super Admin only)
 */
export async function createAdmin(data: z.infer<typeof createAdminSchema>) {
  try {
    const user = await requireSuperAdmin();

    // Only the designated super admin can create other super admins
    if (data.isSuperAdmin && user.email !== SUPER_ADMIN_EMAIL) {
      return { error: "Only the primary super admin can create other super admins" };
    }

    const validated = createAdminSchema.parse(data);

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: validated.email },
    });

    if (existingAdmin) {
      return { error: "An admin with this email already exists" };
    }

    // Check if email exists as student
    const existingStudent = await prisma.student.findUnique({
      where: { email: validated.email },
    });

    if (existingStudent) {
      return { error: "This email is already registered as a student" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validated.password, 10);

    // Create admin
    const admin = await prisma.admin.create({
      data: {
        email: validated.email,
        name: validated.name,
        password: hashedPassword,
        isSuperAdmin: validated.isSuperAdmin,
        emailVerified: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        isSuperAdmin: true,
      },
    });

    // Log activity
    await prisma.adminActivityLog.create({
      data: {
        adminId: user.id,
        action: "CREATE_ADMIN",
        entityType: "ADMIN",
        entityId: admin.id,
        details: {
          newAdminEmail: admin.email,
          isSuperAdmin: admin.isSuperAdmin,
        },
      },
    });

    revalidatePath("/admin-dashboard-secret/admins");

    return { success: true, admin };
  } catch (error) {
    console.error("Error creating admin:", error);
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    return { error: "Failed to create admin" };
  }
}

/**
 * Update admin (Super Admin only)
 */
export async function updateAdmin(data: z.infer<typeof updateAdminSchema>) {
  try {
    const user = await requireSuperAdmin();

    const validated = updateAdminSchema.parse(data);

    // Get existing admin
    const existingAdmin = await prisma.admin.findUnique({
      where: { id: validated.id },
    });

    if (!existingAdmin) {
      return { error: "Admin not found" };
    }

    // Prevent removing super admin status from the primary super admin
    if (
      existingAdmin.email === SUPER_ADMIN_EMAIL &&
      validated.isSuperAdmin === false
    ) {
      return { error: "Cannot remove super admin status from the primary super admin" };
    }

    // Only the designated super admin can grant/revoke super admin status
    if (
      validated.isSuperAdmin !== undefined &&
      validated.isSuperAdmin !== existingAdmin.isSuperAdmin &&
      user.email !== SUPER_ADMIN_EMAIL
    ) {
      return { error: "Only the primary super admin can change super admin status" };
    }

    // Update admin
    const admin = await prisma.admin.update({
      where: { id: validated.id },
      data: {
        name: validated.name,
        isSuperAdmin: validated.isSuperAdmin,
      },
      select: {
        id: true,
        email: true,
        name: true,
        isSuperAdmin: true,
      },
    });

    // Log activity
    await prisma.adminActivityLog.create({
      data: {
        adminId: user.id,
        action: "UPDATE_ADMIN",
        entityType: "ADMIN",
        entityId: admin.id,
        details: {
          changes: validated,
        },
      },
    });

    revalidatePath("/admin-dashboard-secret/admins");

    return { success: true, admin };
  } catch (error) {
    console.error("Error updating admin:", error);
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    return { error: "Failed to update admin" };
  }
}

/**
 * Delete admin (Super Admin only)
 */
export async function deleteAdmin(adminId: string) {
  try {
    const user = await requireSuperAdmin();

    // Get admin to delete
    const adminToDelete = await prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!adminToDelete) {
      return { error: "Admin not found" };
    }

    // Prevent deleting the primary super admin
    if (adminToDelete.email === SUPER_ADMIN_EMAIL) {
      return { error: "Cannot delete the primary super admin" };
    }

    // Delete admin
    await prisma.admin.delete({
      where: { id: adminId },
    });

    // Log activity
    await prisma.adminActivityLog.create({
      data: {
        adminId: user.id,
        action: "DELETE_ADMIN",
        entityType: "ADMIN",
        entityId: adminId,
        details: {
          deletedAdminEmail: adminToDelete.email,
        },
      },
    });

    revalidatePath("/admin-dashboard-secret/admins");

    return { success: true };
  } catch (error) {
    console.error("Error deleting admin:", error);
    return { error: "Failed to delete admin" };
  }
}

/**
 * Promote student to admin (Super Admin only)
 */
export async function promoteStudentToAdmin(
  studentId: string,
  notes?: string
) {
  try {
    const user = await requireSuperAdmin();

    // Get student
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return { error: "Student not found" };
    }

    // Check if already an admin
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: student.email },
    });

    if (existingAdmin) {
      return { error: "This student is already an admin" };
    }

    // Create admin account with same credentials
    const admin = await prisma.admin.create({
      data: {
        email: student.email,
        name: student.name || "Admin",
        password: student.password || "",
        image: student.image,
        emailVerified: student.emailVerified,
        isSuperAdmin: false,
      },
    });

    // Record the conversion
    await prisma.studentToAdminConversion.create({
      data: {
        studentEmail: student.email,
        studentId: student.id,
        adminId: admin.id,
        convertedBy: user.id,
        notes,
      },
    });

    // Log activity
    await prisma.adminActivityLog.create({
      data: {
        adminId: user.id,
        action: "PROMOTE_STUDENT_TO_ADMIN",
        entityType: "ADMIN",
        entityId: admin.id,
        details: {
          studentId: student.id,
          studentEmail: student.email,
          notes,
        },
      },
    });

    revalidatePath("/admin-dashboard-secret/admins");
    revalidatePath("/admin-dashboard-secret/users");

    return { success: true, admin };
  } catch (error) {
    console.error("Error promoting student to admin:", error);
    return { error: "Failed to promote student to admin" };
  }
}
