"use server";

import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth-helpers";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const LEADER_EMAIL = "qdeehai@gmail.com";

// Schema for updating user role
const updateRoleSchema = z.object({
  userId: z.string(),
  userType: z.enum(["STUDENT", "ADMIN"]),
  role: z.enum(["USER", "VIP", "ADMIN", "LEADER"]),
});

/**
 * Get all users (students and admins) with their roles
 * Only accessible by LEADER
 */
export async function getAllUsersWithRoles() {
  try {
    const currentUser = await requireSuperAdmin();
    
    // Only LEADER can access permissions manager
    if (currentUser.email !== LEADER_EMAIL) {
      return { error: "Access denied. Only LEADER can manage permissions." };
    }

    // Get all students with role
    const students = await prisma.student.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        blocked: true,
        createdAt: true,
        _count: {
          select: {
            enrollments: true,
            payments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get all admins with role
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        isSuperAdmin: true,
        createdAt: true,
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

    // Combine and format users
    const allUsers = [
      ...students.map((student) => ({
        id: student.id,
        name: student.name,
        email: student.email,
        image: student.image,
        role: student.role,
        userType: "STUDENT" as const,
        blocked: student.blocked,
        createdAt: student.createdAt,
        stats: {
          enrollments: student._count.enrollments,
          payments: student._count.payments,
        },
      })),
      ...admins.map((admin) => ({
        id: admin.id,
        name: admin.name,
        email: admin.email,
        image: admin.image,
        role: admin.role,
        userType: "ADMIN" as const,
        isSuperAdmin: admin.isSuperAdmin,
        createdAt: admin.createdAt,
        stats: {
          activityLogs: admin._count.activityLogs,
        },
      })),
    ];

    return { success: true, users: allUsers };
  } catch (error) {
    console.error("Error fetching users with roles:", error);
    return { error: "Failed to fetch users" };
  }
}

/**
 * Update user role
 * Only LEADER can change roles
 */
export async function updateUserRole(data: z.infer<typeof updateRoleSchema>) {
  try {
    const currentUser = await requireSuperAdmin();
    
    // Only LEADER can update roles
    if (currentUser.email !== LEADER_EMAIL) {
      return { error: "Access denied. Only LEADER can update roles." };
    }

    const validated = updateRoleSchema.parse(data);

    // Get user to check current email
    let targetUser;
    if (validated.userType === "STUDENT") {
      targetUser = await prisma.student.findUnique({
        where: { id: validated.userId },
        select: { email: true, role: true },
      });
    } else {
      targetUser = await prisma.admin.findUnique({
        where: { id: validated.userId },
        select: { email: true, role: true },
      });
    }

    if (!targetUser) {
      return { error: "User not found" };
    }

    // Prevent changing LEADER's own role
    if (targetUser.email === LEADER_EMAIL && validated.role !== "LEADER") {
      return { error: "Cannot change LEADER's role" };
    }

    // Prevent setting other users as LEADER
    if (validated.role === "LEADER" && targetUser.email !== LEADER_EMAIL) {
      return { error: "Only the designated email (qdeehai@gmail.com) can have LEADER role" };
    }

    // Update role based on user type
    if (validated.userType === "STUDENT") {
      await prisma.student.update({
        where: { id: validated.userId },
        data: { role: validated.role },
      });
    } else {
      await prisma.admin.update({
        where: { id: validated.userId },
        data: { role: validated.role },
      });
    }

    // Log activity
    const adminUser = await prisma.admin.findUnique({
      where: { email: currentUser.email },
    });

    if (adminUser) {
      await prisma.adminActivityLog.create({
        data: {
          adminId: adminUser.id,
          action: "UPDATE_USER_ROLE",
          entityType: validated.userType,
          entityId: validated.userId,
          details: {
            newRole: validated.role,
            oldRole: targetUser.role,
            targetEmail: targetUser.email,
          },
        },
      });
    }

    revalidatePath("/admin-dashboard-secret/permissions");

    return { success: true };
  } catch (error) {
    console.error("Error updating user role:", error);
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    return { error: "Failed to update user role" };
  }
}

/**
 * Get role statistics
 */
export async function getRoleStatistics() {
  try {
    const currentUser = await requireSuperAdmin();
    
    if (currentUser.email !== LEADER_EMAIL) {
      return { error: "Access denied. Only LEADER can view statistics." };
    }

    const [studentRoles, adminRoles] = await Promise.all([
      prisma.student.groupBy({
        by: ["role"],
        _count: true,
      }),
      prisma.admin.groupBy({
        by: ["role"],
        _count: true,
      }),
    ]);

    const stats = {
      USER: 0,
      VIP: 0,
      ADMIN: 0,
      LEADER: 0,
    };

    studentRoles.forEach((group) => {
      stats[group.role] = (stats[group.role] || 0) + group._count;
    });

    adminRoles.forEach((group) => {
      stats[group.role] = (stats[group.role] || 0) + group._count;
    });

    return { success: true, stats };
  } catch (error) {
    console.error("Error fetching role statistics:", error);
    return { error: "Failed to fetch statistics" };
  }
}
