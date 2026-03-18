"use client";

import clsx from "clsx";
import {
    BookOpen,
    Clock,
    HelpCircle,
    LayoutDashboard,
    LogOut,
    Settings,
    ShieldCheck,
    Zap
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export default function Sidebar({ timeLeft = "1:59:00" }) {
    const { data: session } = useSession();
    const role = session?.user?.role || "employee";
    const pathname = usePathname();

    const handleLogout = () => {
        signOut({ callbackUrl: "/login" });
    };

    const sections = [
        {
            title: "Navigation",
            items: [
                { name: "Dashboard", icon: LayoutDashboard, href: "/", roles: ["global_admin", "admin", "employee"] },
            ]
        },
        {
            title: "Learning Center",
            roles: ["global_admin", "admin", "employee"],
            items: [
                {
                    name: "Knowledge Base",
                    icon: BookOpen,
                    href: "/knowledge",
                    roles: ["global_admin", "admin", "employee"],
                },
            ]
        },
        {
            title: "Administration",
            roles: ["global_admin", "admin"],
            items: [
                { name: "User Management", icon: ShieldCheck, href: "/admin/users", roles: ["global_admin", "admin"] },
            ]
        },
        {
            title: "System",
            items: [
                { name: "Settings", icon: Settings, href: "/settings", roles: ["global_admin", "admin", "employee"] },
            ]
        }
    ];

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-white/50 backdrop-blur-3xl text-foreground overflow-hidden flex flex-col">
            <div className="flex flex-col px-4 py-8 h-full">
                {/* Logo */}
                <div className="mb-10 flex items-center gap-3 px-2">
                    <div className="flex h-11 w-11 items-center justify-center rounded-[0.9rem] bg-linear-to-br from-brand to-brand/60 font-black text-white shadow-xl shadow-brand/20">
                        EX
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-black leading-tight tracking-tight uppercase">
                            Exon
                        </span>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">
                            Dashboard
                        </span>
                    </div>
                </div>

                {/* Access Timer for restricted roles */}
                {(role === "employee" || role === "admin") && (
                    <div className="group mb-8 relative overflow-hidden rounded-3xl bg-zinc-950 p-5 text-white shadow-2xl">
                        <div className="relative z-10">
                            <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                <Clock className="size-3.5" />
                                <span>Session Time</span>
                            </div>
                            <div className="text-2xl font-black font-mono tracking-tighter">
                                {timeLeft}
                            </div>
                            <div className="mt-2 h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                                <div className="h-full w-[80%] bg-brand transition-all duration-1000" />
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:scale-110 transition-transform">
                            <Zap className="size-16" />
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 space-y-7 overflow-y-auto pr-1">
                    {sections.map((section, idx) => {
                        const filteredItems = section.items.filter(item => item.roles.includes(role));
                        if (filteredItems.length === 0) return null;

                        return (
                            <div key={idx} className="space-y-3">
                                <h3 className="px-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                    {section.title}
                                </h3>
                                <div className="space-y-1">
                                    {filteredItems.map((item) => {
                                        const isActive = pathname === item.href;
                                        const Icon = item.icon;

                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={cn(
                                                    "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold transition-all duration-300",
                                                    isActive
                                                        ? "bg-zinc-950 text-white shadow-xl"
                                                        : "text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900"
                                                )}
                                            >
                                                <Icon className="size-5" />
                                                {item.name}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="mt-auto space-y-1 pt-6 border-t border-zinc-200">
                    <button className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900 transition-all">
                        <HelpCircle className="size-5" />
                        Help Center
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-all"
                    >
                        <LogOut className="size-5" />
                        Logout
                    </button>
                </div>
            </div>
        </aside>
    );
}
