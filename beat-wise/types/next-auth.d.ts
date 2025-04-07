import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken: string | null;
    refreshToken: string | null;
    expiresAt: number | null;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    userId?: string;
  }
}