"use client";

import { useState } from "react";
import { adminSignInAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Shield } from "lucide-react";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Signing in..." : "Admin Sign In"}
    </Button>
  );
}

export default function AdminSignInPage() {
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setError("");
    const result = await adminSignInAction(formData);
    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-destructive/10 to-background p-4">
      <Card className="w-full max-w-md border-destructive/20">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="flex items-center gap-2 font-bold text-2xl">
              <Shield className="h-8 w-8 text-destructive" />
              <span>Admin Access</span>
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Administrator Login</CardTitle>
          <CardDescription className="text-center">
            This area is restricted to administrators only
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@qdeeh.ai"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>

            <SubmitButton />

            <div className="text-center text-sm">
              <Link href="/" className="text-muted-foreground hover:text-primary">
                ← Back to main site
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
