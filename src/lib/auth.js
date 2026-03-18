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
                    brandColor: user.brandColor,
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
                token.brandColor = user.brandColor;
            }
            if (trigger === "update" && session?.user) {
                token.name = session.user.name;
                token.email = session.user.email;
                if (session.user.brandColor) {
                    token.brandColor = session.user.brandColor;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.role = token.role;
                session.user.id = token.id;
                session.user.brandColor = token.brandColor;
            }
            return session;
        },
    },
    events: {
        async signIn({ user }) {
            try {
                const { headers: nextHeaders } = await import("next/headers");
                const headerList = await nextHeaders();
                const ip = headerList.get("x-forwarded-for") || "127.0.0.1";
                const userAgent = headerList.get("user-agent") || "unknown";

                const parseUA = (ua) => {
                    let browser = "Other";
                    let os = "Other";
                    let device = "Desktop";

                    if (/chrome/i.test(ua)) browser = "Chrome";
                    else if (/firefox/i.test(ua)) browser = "Firefox";
                    else if (/safari/i.test(ua)) browser = "Safari";
                    else if (/edge/i.test(ua)) browser = "Edge";

                    if (/windows/i.test(ua)) os = "Windows";
                    else if (/mac/i.test(ua)) os = "macOS";
                    else if (/linux/i.test(ua)) os = "Linux";
                    else if (/android/i.test(ua)) os = "Android";
                    else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";

                    if (/mobile|android|iphone|ipad|ipod/i.test(ua)) device = "Mobile/Tablet";

                    return { browser, os, device };
                };

                const { browser, os, device } = parseUA(userAgent);

                await prisma.loginHistory.create({
                    data: {
                        userId: user.id,
                        ip: ip.split(',')[0].trim(), // Handle forwarded-for lists
                        userAgent,
                        browser,
                        os,
                        device,
                    },
                });

                // Create a dynamic notification for the login
                await prisma.notification.create({
                    data: {
                        userId: user.id,
                        title: "New Login Detected",
                        message: `A new login was detected from ${browser} on ${os} (IP: ${ip.split(',')[0].trim()})`,
                        type: "warning"
                    }
                });
            } catch (error) {
                console.error("Error recording login history:", error);
            }
        },
    },
};
