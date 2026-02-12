import { auth } from "@/auth";
import { UserNav } from "@/components/user-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Home } from "lucide-react";

export async function AdminHeader() {
  const session = await auth();

  return (
    <header className="border-b bg-background">
      <div className="flex h-16 items-center justify-between px-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Back to Site
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          {session?.user && <UserNav user={session.user} />}
        </div>
      </div>
    </header>
  );
}
