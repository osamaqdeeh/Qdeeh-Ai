"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Tag,
  MessageSquare,
  BarChart3,
  Settings,
  Video,
  Shield,
  GraduationCap,
  DollarSign,
  UserCog,
  Crown,
} from "lucide-react";
import { useSession } from "next-auth/react";

interface MenuItem {
  title: string;
  href: string;
  icon: any;
  superAdminOnly?: boolean;
  leaderOnly?: boolean;
}

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    href: "/admin-dashboard-secret",
    icon: LayoutDashboard,
  },
  {
    title: "Courses",
    href: "/admin-dashboard-secret/courses",
    icon: BookOpen,
  },
  {
    title: "Videos",
    href: "/admin-dashboard-secret/videos",
    icon: Video,
  },
  {
    title: "Users",
    href: "/admin-dashboard-secret/users",
    icon: Users,
  },
  {
    title: "Enrollments",
    href: "/admin-dashboard-secret/enrollments",
    icon: GraduationCap,
  },
  {
    title: "Coupons",
    href: "/admin-dashboard-secret/coupons",
    icon: Tag,
  },
  {
    title: "Reviews",
    href: "/admin-dashboard-secret/reviews",
    icon: MessageSquare,
  },
  {
    title: "Analytics",
    href: "/admin-dashboard-secret/analytics",
    icon: BarChart3,
  },
  {
    title: "Revenue",
    href: "/admin-dashboard-secret/revenue",
    icon: DollarSign,
  },
  {
    title: "Admins",
    href: "/admin-dashboard-secret/admins",
    icon: UserCog,
    superAdminOnly: true,
  },
  {
    title: "Permissions",
    href: "/admin-dashboard-secret/permissions",
    icon: Crown,
    leaderOnly: true,
  },
  {
    title: "Settings",
    href: "/admin-dashboard-secret/settings",
    icon: Settings,
  },
];

const LEADER_EMAIL = "qdeehai@gmail.com";

export function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.isSuperAdmin === true;
  const isLeader = session?.user?.email === LEADER_EMAIL;

  return (
    <aside className="w-64 border-r bg-background h-screen sticky top-0">
      <div className="p-6">
        <Link href="/admin-dashboard-secret" className="flex items-center gap-2 font-bold text-xl">
          <Shield className="h-6 w-6 text-primary" />
          <span>Admin Panel</span>
        </Link>
      </div>
      <nav className="px-3 space-y-1">
        {menuItems.map((item) => {
          // Hide super admin only items from regular admins
          if (item.superAdminOnly && !isSuperAdmin) {
            return null;
          }
          
          // Hide leader only items from non-leaders
          if (item.leaderOnly && !isLeader) {
            return null;
          }
          
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                item.leaderOnly && "border-l-2 border-amber-500"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.title}
              {item.leaderOnly && (
                <Crown className="h-3 w-3 text-amber-500 ml-auto" />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
