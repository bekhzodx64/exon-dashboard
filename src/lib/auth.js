import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";

export const authOptions = {
    adapter: PrismaAdapter(prisma),
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "alex@exon.com" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                console.log("LOGIN_DEBUG: Attempting login for:", credentials?.email);
                
                if (!credentials?.email || !credentials?.password) {
                    console.log("LOGIN_DEBUG: Missing credentials");
                    throw new Error("Missing email or password");
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user) {
                    console.log("LOGIN_DEBUG: User not found in DB");
                    throw new Error("No user found with that email");
                }

                console.log("LOGIN_DEBUG: User found, hashing password check...");
                const isValid = await bcrypt.compare(credentials.password, user.password);

                if (!isValid) {
                    console.log("LOGIN_DEBUG: Password mismatch");
                    throw new Error("Invalid password");
                }

                console.log("LOGIN_DEBUG: Login SUCCESS for user role:", user.role);
                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
                token.name = user.name;
                token.email = user.email;
            }
            if (trigger === "update" && session?.user) {
                token.name = session.user.name;
                token.email = session.user.email;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.role = token.role;
                session.user.id = token.id;
            }
            return session;
        },
    },
};
