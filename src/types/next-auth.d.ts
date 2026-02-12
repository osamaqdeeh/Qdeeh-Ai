import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      userType: "STUDENT" | "ADMIN";
      isSuperAdmin?: boolean;
    };
  }

  interface User {
    userType: "STUDENT" | "ADMIN";
    isSuperAdmin?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    userType: "STUDENT" | "ADMIN";
    isSuperAdmin?: boolean;
  }
}
