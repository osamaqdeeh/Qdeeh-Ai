"use client";

import { useState } from "react";
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
import { Shield, Mail, Calendar, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Admin {
  id: string;
  name: string;
  email: string;
  image: string | null;
  isSuperAdmin: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
  _count: {
    activityLogs: number;
  };
}

interface AdminsTableProps {
  admins: Admin[];
}

export function AdminsTable({ admins }: AdminsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search admins by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Admin</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAdmins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  {searchTerm ? "No admins found matching your search" : "No admins found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredAdmins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={admin.image || ""} />
                        <AvatarFallback>
                          {admin.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{admin.name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {admin.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    {admin.isSuperAdmin ? (
                      <Badge className="gap-1" variant="default">
                        <Shield className="h-3 w-3" />
                        Super Admin
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Admin</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      {admin._count.activityLogs} actions
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {admin.lastLoginAt ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDistanceToNow(new Date(admin.lastLoginAt), {
                          addSuffix: true,
                        })}
                      </div>
                    ) : (
                      <span className="text-muted-foreground/50">Never</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(admin.createdAt), {
                      addSuffix: true,
                    })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
