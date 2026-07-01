import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/signin",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account"
        }
      },
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.email) return null;

        // Check if user has a password set (might be Google-only user)
        const account = await prisma.account.findFirst({
          where: { userId: user.id, provider: "credentials" },
        });

        if (!account?.refresh_token) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          account.refresh_token
        );

        if (!isValid) return null;

        if (user.isActive === false) {
          throw new Error("此帳號已被停用，請聯絡管理員。");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Only block users who are EXPLICITLY disabled (isActive === false)
      // Do NOT block if isActive is null/undefined (treat as active)
      if (user.email) {
        const existing = await prisma.user.findUnique({ where: { email: user.email }});
        if (existing && existing.isActive === false) {
          return "/auth/signin?error=AccessDenied";
        }
      }

      if (user.email?.toLowerCase() === "maxupport@gmail.com") {
        // Find existing or newly created user in db and force ADMIN and name
        const existing = await prisma.user.findUnique({ where: { email: user.email }});
        if (existing) {
          await prisma.user.update({
            where: { email: user.email },
            data: { role: "ADMIN", name: "Yuo1238", isActive: true }
          });
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session?.isComplete !== undefined) {
        token.isComplete = session.isComplete;
        if (session?.name) token.name = session.name;
      }

      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        
        // Check if user has a credentials account set up
        const credAccount = await prisma.account.findFirst({
          where: { userId: user.id, provider: "credentials" }
        });
        token.isComplete = !!credAccount;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
        (session.user as any).isComplete = token.isComplete;
      }
      return session;
    },
  },
});
