import { auth } from "@/auth";
import { redirect } from "next/navigation";

/**
 * Get the current session user (student or admin) or redirect to sign in
 */
export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin");
  }
  return session.user;
}

/**
 * Get the current student or redirect
 */
export async function getCurrentStudent() {
  const session = await auth();
  if (!session?.user || session.user.userType !== "STUDENT") {
    redirect("/auth/signin");
  }
  return session.user;
}

/**
 * Get the current admin or redirect
 */
export async function getCurrentAdmin() {
  const session = await auth();
  if (!session?.user || session.user.userType !== "ADMIN") {
    redirect("/");
  }
  return session.user;
}

/**
 * Get the current session (may be null)
 */
export async function getSession() {
  return await auth();
}

/**
 * Require admin role or redirect
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.userType !== "ADMIN") {
    redirect("/");
  }
  return session.user;
}

/**
 * Require super admin role or redirect
 */
export async function requireSuperAdmin() {
  const session = await auth();
  if (!session?.user || session.user.userType !== "ADMIN" || !session.user.isSuperAdmin) {
    redirect("/");
  }
  return session.user;
}

/**
 * Check if user is admin
 */
export async function isAdmin() {
  const session = await auth();
  return session?.user?.userType === "ADMIN";
}

/**
 * Check if user is super admin
 */
export async function isSuperAdmin() {
  const session = await auth();
  return session?.user?.userType === "ADMIN" && session.user.isSuperAdmin === true;
}

/**
 * Check if user is student
 */
export async function isStudent() {
  const session = await auth();
  return session?.user?.userType === "STUDENT";
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
  const session = await auth();
  return !!session?.user;
}
