import { requireSuperAdmin } from "@/lib/auth-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PermissionsTable } from "@/components/admin/permissions-table";
import { Shield, Users, Crown, Star, UserCog } from "lucide-react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

const LEADER_EMAIL = "qdeehai@gmail.com";

export default async function PermissionsPage() {
  const currentUser = await requireSuperAdmin();

  // Only LEADER can access this page
  if (currentUser.email !== LEADER_EMAIL) {
    redirect("/admin-dashboard-secret");
  }

  // Fetch users directly instead of using server actions
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
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const admins = await prisma.admin.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      isSuperAdmin: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Combine and format users
  const users = [
    ...students.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      image: s.image,
      role: (s.role || "USER") as "USER" | "VIP" | "ADMIN" | "LEADER",
      userType: "STUDENT" as const,
      blocked: s.blocked,
      createdAt: s.createdAt,
      stats: {
        enrollments: s._count.enrollments,
      },
    })),
    ...admins.map((a) => ({
      id: a.id,
      name: a.name,
      email: a.email,
      image: a.image,
      role: (a.email === LEADER_EMAIL ? "LEADER" : "ADMIN") as "USER" | "VIP" | "ADMIN" | "LEADER",
      userType: "ADMIN" as const,
      blocked: false,
      createdAt: a.createdAt,
      isSuperAdmin: a.isSuperAdmin,
      stats: {
        enrollments: 0,
      },
    })),
  ];

  // Calculate stats
  const stats = {
    LEADER: users.filter((u) => u.role === "LEADER").length,
    ADMIN: users.filter((u) => u.role === "ADMIN").length,
    VIP: users.filter((u) => u.role === "VIP").length,
    USER: users.filter((u) => u.role === "USER").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8 text-amber-500" />
          Permissions Manager
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage user roles and permissions across the platform
        </p>
        <div className="mt-2 px-4 py-3 bg-amber-100 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-lg">
          <p className="text-sm text-amber-800 dark:text-amber-200 flex items-center gap-2">
            <Crown className="h-4 w-4" />
            <strong>LEADER Access:</strong> You have full control over all user permissions. The LEADER role is permanent and exclusive to {LEADER_EMAIL}
          </p>
        </div>
      </div>

      {/* Role Hierarchy Info */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Role Hierarchy & Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border-2 border-amber-500">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-5 w-5 text-amber-500" />
                <h3 className="font-bold text-amber-600 dark:text-amber-400">LEADER</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Master of all permissions. Can manage all roles and has unrestricted access to everything.
              </p>
              <p className="text-xs font-semibold mt-2 text-amber-600">
                ✓ All permissions
              </p>
            </div>
            
            <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border-2 border-blue-500">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-blue-500" />
                <h3 className="font-bold text-blue-600 dark:text-blue-400">ADMIN</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Full administrative access. Can manage courses, users, and content.
              </p>
              <p className="text-xs font-semibold mt-2 text-blue-600">
                ✓ Manage platform
              </p>
            </div>
            
            <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border-2 border-purple-500">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-5 w-5 text-purple-500" />
                <h3 className="font-bold text-purple-600 dark:text-purple-400">VIP</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Premium user with special privileges and exclusive features.
              </p>
              <p className="text-xs font-semibold mt-2 text-purple-600">
                ✓ Premium features
              </p>
            </div>
            
            <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border-2 border-gray-400">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-gray-500" />
                <h3 className="font-bold text-gray-600 dark:text-gray-400">USER</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Standard user with basic access to platform features.
              </p>
              <p className="text-xs font-semibold mt-2 text-gray-600">
                ✓ Basic access
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leaders</CardTitle>
              <Crown className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{stats.LEADER}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Master administrators
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <Shield className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.ADMIN}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Platform administrators
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">VIP Users</CardTitle>
              <Star className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.VIP}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Premium members
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Regular Users</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.USER}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Standard members
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users & Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <PermissionsTable users={users} />
        </CardContent>
      </Card>
    </div>
  );
}
