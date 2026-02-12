import { requireSuperAdmin } from "@/lib/auth-helpers";
import { getAllAdmins } from "@/lib/actions/admins";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminsTable } from "@/components/admin/admins-table";
import { UserCog, Shield, Activity } from "lucide-react";

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default async function AdminsPage() {
  await requireSuperAdmin();

  const result = await getAllAdmins();

  if (result.error || !result.admins) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Management</h1>
          <p className="text-muted-foreground mt-2">
            Error loading admins: {result.error}
          </p>
        </div>
      </div>
    );
  }

  const admins = result.admins;
  const superAdminCount = admins.filter((a) => a.isSuperAdmin).length;
  const regularAdminCount = admins.length - superAdminCount;
  const totalActivity = admins.reduce((sum, admin) => sum + admin._count.activityLogs, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <UserCog className="h-8 w-8" />
          Admin Management
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage admin accounts and permissions (Super Admin Only)
        </p>
        <div className="mt-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-lg">
          <p className="text-sm text-amber-800 dark:text-amber-200 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <strong>Super Admin Access:</strong> Only qdeehai@gmail.com can grant or revoke admin permissions
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{admins.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {regularAdminCount} regular, {superAdminCount} super admin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Super Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{superAdminCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Full system control
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActivity}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Admin actions logged
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Admins Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Administrators</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminsTable admins={admins} />
        </CardContent>
      </Card>
    </div>
  );
}
