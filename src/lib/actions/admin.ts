"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin, requireSuperAdmin } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

/**
 * Convert a student account to admin account
 * Only super admins can do this
 */
export async function convertStudentToAdmin(studentId: string, notes?: string) {
  try {
    const currentAdmin = await requireSuperAdmin();

    // Get student details
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return { error: "Student not found" };
    }

    // Check if already converted
    const existingConversion = await prisma.studentToAdminConversion.findUnique({
      where: { studentEmail: student.email },
    });

    if (existingConversion) {
      return { error: "This student has already been converted to admin" };
    }

    // Check if admin with same email exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: student.email },
    });

    if (existingAdmin) {
      return { error: "An admin account with this email already exists" };
    }

    // Create admin account with same credentials
    const newAdmin = await prisma.admin.create({
      data: {
        email: student.email,
        name: student.name,
        password: student.password, // Use same hashed password
        image: student.image,
        emailVerified: student.emailVerified,
        isSuperAdmin: false,
        permissions: [],
      },
    });

    // Record the conversion
    await prisma.studentToAdminConversion.create({
      data: {
        studentEmail: student.email,
        studentId: student.id,
        adminId: newAdmin.id,
        convertedBy: currentAdmin.id,
        notes,
      },
    });

    // Log the action
    await prisma.adminActivityLog.create({
      data: {
        adminId: currentAdmin.id,
        action: "CONVERT_STUDENT_TO_ADMIN",
        entityType: "STUDENT",
        entityId: studentId,
        details: {
          studentEmail: student.email,
          studentName: student.name,
          newAdminId: newAdmin.id,
          notes,
        },
      },
    });

    // Block the student account (don't delete to preserve history)
    await prisma.student.update({
      where: { id: studentId },
      data: { blocked: true },
    });

    revalidatePath("/admin-dashboard-secret/users");
    return { success: true, adminId: newAdmin.id };
  } catch (error) {
    console.error("Convert student to admin error:", error);
    return { error: "Failed to convert student to admin" };
  }
}

/**
 * Create a new admin account (only super admins)
 */
export async function createAdminAccount(data: {
  email: string;
  name: string;
  password: string;
  isSuperAdmin?: boolean;
}) {
  try {
    const currentAdmin = await requireSuperAdmin();

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: data.email },
    });

    if (existingAdmin) {
      return { error: "Admin with this email already exists" };
    }

    // Check if student with same email exists
    const existingStudent = await prisma.student.findUnique({
      where: { email: data.email },
    });

    if (existingStudent) {
      return { error: "A student account exists with this email. Please convert the student instead." };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create admin
    const newAdmin = await prisma.admin.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        isSuperAdmin: data.isSuperAdmin || false,
        emailVerified: new Date(),
      },
    });

    // Log the action
    await prisma.adminActivityLog.create({
      data: {
        adminId: currentAdmin.id,
        action: "CREATE_ADMIN",
        entityType: "ADMIN",
        entityId: newAdmin.id,
        details: {
          adminEmail: data.email,
          adminName: data.name,
          isSuperAdmin: data.isSuperAdmin || false,
        },
      },
    });

    revalidatePath("/admin-dashboard-secret/users");
    return { success: true, adminId: newAdmin.id };
  } catch (error) {
    console.error("Create admin error:", error);
    return { error: "Failed to create admin account" };
  }
}

/**
 * Get all students (admin only)
 */
export async function getAllStudents() {
  try {
    await requireAdmin();

    const students = await prisma.student.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone: true,
        country: true,
        blocked: true,
        createdAt: true,
        emailVerified: true,
        _count: {
          select: {
            enrollments: true,
            payments: true,
            reviews: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, students };
  } catch (error) {
    console.error("Get students error:", error);
    return { error: "Failed to fetch students" };
  }
}

/**
 * Get all admins (super admin only)
 */
export async function getAllAdmins() {
  try {
    await requireSuperAdmin();

    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        isSuperAdmin: true,
        permissions: true,
        createdAt: true,
        lastLoginAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, admins };
  } catch (error) {
    console.error("Get admins error:", error);
    return { error: "Failed to fetch admins" };
  }
}

/**
 * Block/Unblock a student
 */
export async function toggleStudentBlock(studentId: string) {
  try {
    const currentAdmin = await requireAdmin();

    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return { error: "Student not found" };
    }

    const updated = await prisma.student.update({
      where: { id: studentId },
      data: { blocked: !student.blocked },
    });

    // Log the action
    await prisma.adminActivityLog.create({
      data: {
        adminId: currentAdmin.id,
        action: updated.blocked ? "BLOCK_STUDENT" : "UNBLOCK_STUDENT",
        entityType: "STUDENT",
        entityId: studentId,
        details: {
          studentEmail: student.email,
          studentName: student.name,
        },
      },
    });

    revalidatePath("/admin-dashboard-secret/users");
    return { success: true, blocked: updated.blocked };
  } catch (error) {
    console.error("Toggle student block error:", error);
    return { error: "Failed to update student status" };
  }
}

/**
 * Get admin activity logs
 */
export async function getAdminActivityLogs(limit = 50) {
  try {
    await requireAdmin();

    const logs = await prisma.adminActivityLog.findMany({
      include: {
        admin: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return { success: true, logs };
  } catch (error) {
    console.error("Get activity logs error:", error);
    return { error: "Failed to fetch activity logs" };
  }
}

/**
 * Delete enrollment and revoke course access
 */
export async function deleteEnrollment(enrollmentId: string) {
  try {
    await requireAdmin();

    // Get enrollment details before deleting
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: true,
      },
    });

    if (!enrollment) {
      return { error: "Enrollment not found" };
    }

    // Delete the enrollment
    await prisma.enrollment.delete({
      where: { id: enrollmentId },
    });

    // Decrement course student count
    await prisma.course.update({
      where: { id: enrollment.courseId },
      data: {
        studentsCount: {
          decrement: 1,
        },
      },
    });

    // Note: We don't delete the payment record to maintain audit trail
    // But we could mark it as refunded or cancelled if needed

    revalidatePath("/admin-dashboard-secret/enrollments");
    revalidatePath("/admin-dashboard-secret/users");
    revalidatePath("/dashboard");
    
    return { success: true };
  } catch (error) {
    console.error("Delete enrollment error:", error);
    return { error: "Failed to delete enrollment" };
  }
}
