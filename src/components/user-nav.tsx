"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOutAction } from "@/lib/actions/auth";
import Link from "next/link";
import { LogOut, LayoutDashboard, Shield } from "lucide-react";

interface UserNavProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    userType?: "STUDENT" | "ADMIN";
    isSuperAdmin?: boolean;
  };
}

export function UserNav({ user }: UserNavProps) {
  const isAdmin = user.userType === "ADMIN";
  const isStudent = user.userType === "STUDENT";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.image || undefined} alt={user.name || ""} />
            <AvatarFallback>
              {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            {isAdmin && (
              <p className="text-xs leading-none text-destructive font-semibold mt-1">
                {user.isSuperAdmin ? "SUPER ADMIN" : "ADMIN"}
              </p>
            )}
            {isStudent && (
              <p className="text-xs leading-none text-primary font-semibold mt-1">
                STUDENT
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {isStudent && (
            <DropdownMenuItem asChild>
              <Link href="/dashboard" className="cursor-pointer">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>My Dashboard</span>
              </Link>
            </DropdownMenuItem>
          )}
          {isAdmin && (
            <DropdownMenuItem asChild>
              <Link href="/admin-dashboard-secret" className="cursor-pointer">
                <Shield className="mr-2 h-4 w-4" />
                <span>Admin Panel</span>
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => signOutAction()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
