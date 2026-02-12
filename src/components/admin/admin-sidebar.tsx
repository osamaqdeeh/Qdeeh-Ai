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
} from "lucide-react";

const menuItems = [
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
    title: "Settings",
    href: "/admin-dashboard-secret/settings",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

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
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.title}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
