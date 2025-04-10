import { prisma } from "@/utils/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";

const scopes = "user-read-email user-read-private user-top-read playlist-modify-private playlist-modify-public";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID as string,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET as string,
      authorization: { params: { scope: scopes } },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at,
          userId: user.id,
        };
      }
      
      return token;
    },
    async session({ session, token, user }) {
      if (token) {
        session.accessToken = token.accessToken || null;
        session.refreshToken = token.refreshToken || null;
        session.expiresAt = token.expiresAt || null;
        
        if (session.user) {
          session.user.id = token.userId || user?.id;
        }
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
  },
};