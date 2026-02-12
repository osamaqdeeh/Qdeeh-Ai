import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  userType: z.enum(["STUDENT", "ADMIN"]).default("STUDENT"),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
  },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [Google({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          allowDangerousEmailAccountLinking: true,
        })]
      : []),
    ...(process.env.GITHUB_ID && process.env.GITHUB_SECRET
      ? [GitHub({
          clientId: process.env.GITHUB_ID,
          clientSecret: process.env.GITHUB_SECRET,
          allowDangerousEmailAccountLinking: true,
        })]
      : []),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        userType: { label: "User Type", type: "text" },
      },
      async authorize(credentials) {
        try {
          const { email, password, userType } = loginSchema.parse(credentials);

          // Check if admin login
          if (userType === "ADMIN") {
            const admin = await prisma.admin.findUnique({
              where: { email },
            });

            if (!admin || !admin.password) {
              throw new Error("Invalid credentials");
            }

            const isPasswordValid = await bcrypt.compare(password, admin.password);

            if (!isPasswordValid) {
              throw new Error("Invalid credentials");
            }

            // Update last login
            await prisma.admin.update({
              where: { id: admin.id },
              data: { lastLoginAt: new Date() },
            });

            return {
              id: admin.id,
              email: admin.email,
              name: admin.name,
              image: admin.image,
              userType: "ADMIN" as const,
              isSuperAdmin: admin.isSuperAdmin,
            };
          } else {
            // Student login
            const student = await prisma.student.findUnique({
              where: { email },
            });

            if (!student || !student.password) {
              throw new Error("Invalid credentials");
            }

            if (student.blocked) {
              throw new Error("Account has been blocked");
            }

            const isPasswordValid = await bcrypt.compare(password, student.password);

            if (!isPasswordValid) {
              throw new Error("Invalid credentials");
            }

            return {
              id: student.id,
              email: student.email,
              name: student.name,
              image: student.image,
              userType: "STUDENT" as const,
            };
          }
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id || "";
        token.userType = user.userType;
        token.isSuperAdmin = user.isSuperAdmin;
      }

      // Handle session updates
      if (trigger === "update" && session) {
        token = { ...token, ...session };
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.id as string) || "";
        session.user.userType = token.userType as "STUDENT" | "ADMIN";
        session.user.isSuperAdmin = token.isSuperAdmin as boolean;
      }
      return session;
    },
  },
  events: {
    async linkAccount({ user }) {
      // For OAuth, create as student by default
      const userType = "STUDENT";
      
      if (userType === "STUDENT") {
        await prisma.student.update({
          where: { id: user.id },
          data: { emailVerified: new Date() },
        });
      }
    },
  },
});
