"use client";

import { useState, useTransition } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, Shield, Star, Users, Mail, Calendar, ChevronDown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { updateUserRole } from "@/lib/actions/permissions";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

type UserRole = "USER" | "VIP" | "ADMIN" | "LEADER";

interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: UserRole;
  userType: "STUDENT" | "ADMIN";
  blocked?: boolean;
  isSuperAdmin?: boolean;
  createdAt: Date;
  stats?: {
    enrollments?: number;
    payments?: number;
    activityLogs?: number;
  };
}

interface PermissionsTableProps {
  users: User[];
}

const LEADER_EMAIL = "qdeehai@gmail.com";

const roleConfig = {
  LEADER: {
    label: "Leader",
    icon: Crown,
    color: "text-amber-600",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    borderColor: "border-amber-500",
  },
  ADMIN: {
    label: "Admin",
    icon: Shield,
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    borderColor: "border-blue-500",
  },
  VIP: {
    label: "VIP",
    icon: Star,
    color: "text-purple-600",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    borderColor: "border-purple-500",
  },
  USER: {
    label: "User",
    icon: Users,
    color: "text-gray-600",
    bgColor: "bg-gray-100 dark:bg-gray-900/30",
    borderColor: "border-gray-500",
  },
};

export function PermissionsTable({ users }: PermissionsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");
  const [userTypeFilter, setUserTypeFilter] = useState<"ALL" | "STUDENT" | "ADMIN">("ALL");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
    const matchesType = userTypeFilter === "ALL" || user.userType === userTypeFilter;
    return matchesSearch && matchesRole && matchesType;
  });

  const handleRoleChange = async (userId: string, userType: "STUDENT" | "ADMIN", newRole: UserRole) => {
    startTransition(async () => {
      const result = await updateUserRole({ userId, userType, role: newRole });
      
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Role Updated",
          description: `User role has been updated to ${newRole}`,
        });
      }
    });
  };

  const getRoleBadge = (role: UserRole) => {
    const config = roleConfig[role];
    const Icon = config.icon;
    
    return (
      <Badge className={`gap-1 ${config.bgColor} ${config.color} ${config.borderColor} border`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
        
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as UserRole | "ALL")}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="ALL">All Roles</option>
          <option value="LEADER">Leader</option>
          <option value="ADMIN">Admin</option>
          <option value="VIP">VIP</option>
          <option value="USER">User</option>
        </select>

        <select
          value={userTypeFilter}
          onChange={(e) => setUserTypeFilter(e.target.value as "ALL" | "STUDENT" | "ADMIN")}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="ALL">All Types</option>
          <option value="STUDENT">Students</option>
          <option value="ADMIN">Admins</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Current Role</TableHead>
              <TableHead>Stats</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  {searchTerm || roleFilter !== "ALL" || userTypeFilter !== "ALL"
                    ? "No users found matching your filters"
                    : "No users found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => {
                const isLeader = user.email === LEADER_EMAIL;
                
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.image || ""} />
                          <AvatarFallback>
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {user.name}
                            {user.blocked && (
                              <Badge variant="destructive" className="text-xs">Blocked</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.userType === "ADMIN" ? "default" : "secondary"}>
                        {user.userType}
                      </Badge>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.userType === "STUDENT" ? (
                        <div>
                          {user.stats?.enrollments || 0} courses • {user.stats?.payments || 0} payments
                        </div>
                      ) : (
                        <div>{user.stats?.activityLogs || 0} actions</div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDistanceToNow(new Date(user.createdAt), {
                          addSuffix: true,
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      {isLeader ? (
                        <Badge variant="outline" className="text-xs">
                          Protected
                        </Badge>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isPending}
                              className="h-8"
                            >
                              Change Role
                              <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Assign Role</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleRoleChange(user.id, user.userType, "USER")}
                              disabled={user.role === "USER"}
                            >
                              <Users className="mr-2 h-4 w-4 text-gray-600" />
                              User
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleRoleChange(user.id, user.userType, "VIP")}
                              disabled={user.role === "VIP"}
                            >
                              <Star className="mr-2 h-4 w-4 text-purple-600" />
                              VIP
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleRoleChange(user.id, user.userType, "ADMIN")}
                              disabled={user.role === "ADMIN"}
                            >
                              <Shield className="mr-2 h-4 w-4 text-blue-600" />
                              Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem disabled className="text-muted-foreground">
                              <Crown className="mr-2 h-4 w-4 text-amber-600" />
                              Leader (Reserved)
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredUsers.length} of {users.length} users
      </div>
    </div>
  );
}
