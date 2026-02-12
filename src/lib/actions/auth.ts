"use server";

import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { AuthError } from "next-auth";

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
});

export async function signUpAction(formData: FormData) {
  try {
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      phone: formData.get("phone") as string | null,
      country: formData.get("country") as string | null,
    };

    const validated = signUpSchema.parse(data);

    // Check if student already exists
    const existingStudent = await prisma.student.findUnique({
      where: { email: validated.email },
    });

    if (existingStudent) {
      return { error: "A student with this email already exists" };
    }

    // Check if admin exists with same email
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: validated.email },
    });

    if (existingAdmin) {
      return { error: "An account with this email already exists" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validated.password, 10);

    // Create student account
    await prisma.student.create({
      data: {
        name: validated.name,
        email: validated.email,
        password: hashedPassword,
        phone: validated.phone || undefined,
        country: validated.country || undefined,
      },
    });

    // Auto sign in as student - signIn throws a redirect, not an error
    await signIn("credentials", {
      email: validated.email,
      password: validated.password,
      userType: "STUDENT",
      redirectTo: "/dashboard",
    });

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    // Check if it's a redirect (NEXT_REDIRECT is expected behavior)
    if (error && typeof error === "object" && "digest" in error && 
        typeof error.digest === "string" && error.digest.includes("NEXT_REDIRECT")) {
      throw error; // Re-throw redirect to allow it to work
    }
    console.error("Sign up error:", error);
    return { error: "An error occurred during sign up" };
  }
}

export async function signInAction(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const userType = formData.get("userType") as "STUDENT" | "ADMIN" || "STUDENT";

    await signIn("credentials", {
      email,
      password,
      userType,
      redirectTo: userType === "ADMIN" ? "/admin-dashboard-secret" : "/dashboard",
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials" };
        default:
          return { error: "An error occurred during sign in" };
      }
    }
    // Check if it's a redirect (NEXT_REDIRECT is expected behavior)
    if (error && typeof error === "object" && "digest" in error && 
        typeof error.digest === "string" && error.digest.includes("NEXT_REDIRECT")) {
      throw error; // Re-throw redirect to allow it to work
    }
    throw error;
  }
}

export async function adminSignInAction(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    await signIn("credentials", {
      email,
      password,
      userType: "ADMIN",
      redirectTo: "/admin-dashboard-secret",
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid admin credentials" };
        default:
          return { error: "An error occurred during sign in" };
      }
    }
    // Check if it's a redirect (NEXT_REDIRECT is expected behavior)
    if (error && typeof error === "object" && "digest" in error && 
        typeof error.digest === "string" && error.digest.includes("NEXT_REDIRECT")) {
      throw error; // Re-throw redirect to allow it to work
    }
    throw error;
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
