import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { UserNav } from "@/components/user-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { BookOpen } from "lucide-react";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <BookOpen className="h-6 w-6 text-primary" />
            <span>QdeehAi</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/courses" className="transition-colors hover:text-primary">
              Courses
            </Link>
            {session && (
              <Link href="/dashboard" className="transition-colors hover:text-primary">
                My Learning
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          {session ? (
            <UserNav user={session.user} />
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
