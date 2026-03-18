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
    Zap,
    ChevronLeft,
    ChevronRight,
    Search,
    Bell
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { twMerge } from "tailwind-merge";
import { useSidebar } from "./SidebarProvider";

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export default function Sidebar({ timeLeft = "1:59:00" }) {
    const { isCollapsed, toggleSidebar } = useSidebar();
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
                { name: "Notifications", icon: Bell, href: "/notifications", roles: ["global_admin", "admin", "employee"] },
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
        <aside 
            className={cn(
                "fixed left-0 top-0 z-40 h-screen border-r border-border bg-white/50 backdrop-blur-3xl text-foreground flex flex-col transition-all duration-300 ease-in-out",
                isCollapsed ? "w-20" : "w-64"
            )}
        >
            <div className={cn("flex flex-col h-full", isCollapsed ? "px-3 py-6" : "px-4 py-8")}>
                {/* Logo & Toggle */}
                <div className={cn("mb-10 flex items-center transition-all", isCollapsed ? "justify-center" : "gap-3 px-2")}>
                    <div className="shrink-0 flex h-11 w-11 items-center justify-center rounded-[0.9rem] bg-linear-to-br from-brand to-brand/60 font-black text-white shadow-xl shadow-brand/20">
                        EX
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-300">
                            <span className="text-lg font-black leading-tight tracking-tight uppercase">
                                Exon
                            </span>
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">
                                Dashboard
                            </span>
                        </div>
                    )}
                </div>
                
                {/* Collapse Toggle Button - Positioned absolutely slightly off the border */}
                <button 
                    onClick={toggleSidebar}
                    className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-white text-zinc-400 shadow-sm hover:text-brand transition-colors z-50"
                >
                    {isCollapsed ? <ChevronRight className="size-3" /> : <ChevronLeft className="size-3" />}
                </button>

                {/* Access Timer */}
                {(role === "employee" || role === "admin") && (
                    <div className={cn(
                        "group mb-8 relative overflow-hidden rounded-3xl bg-zinc-950 text-white shadow-2xl transition-all duration-300",
                        isCollapsed ? "p-3" : "p-5"
                    )}>
                        <div className="relative z-10 flex flex-col items-center">
                            {!isCollapsed && (
                                <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 w-full animate-in fade-in duration-300">
                                    <Clock className="size-3.5" />
                                    <span>Session Time</span>
                                </div>
                            )}
                            {isCollapsed ? (
                                <Clock className="size-5 text-zinc-400" title={timeLeft} />
                            ) : (
                                <div className="text-2xl font-black font-mono tracking-tighter w-full animate-in fade-in duration-300">
                                    {timeLeft}
                                </div>
                            )}
                            {!isCollapsed && (
                                <div className="mt-2 h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden animate-in fade-in duration-300">
                                    <div className="h-full w-[80%] bg-brand transition-all duration-1000" />
                                </div>
                            )}
                        </div>
                        {!isCollapsed && (
                            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:scale-110 transition-transform">
                                <Zap className="size-16" />
                            </div>
                        )}
                    </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 space-y-7 overflow-y-auto overflow-x-hidden pr-1 custom-scrollbar">
                    {sections.map((section, idx) => {
                        const filteredItems = section.items.filter(item => item.roles.includes(role));
                        if (filteredItems.length === 0) return null;

                        return (
                            <div key={idx} className="space-y-3">
                                {!isCollapsed && (
                                    <h3 className="px-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 animate-in fade-in duration-300">
                                        {section.title}
                                    </h3>
                                )}
                                <div className="space-y-1">
                                    {filteredItems.map((item) => {
                                        const isActive = pathname === item.href;
                                        const Icon = item.icon;

                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                title={isCollapsed ? item.name : ""}
                                                className={cn(
                                                    "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold transition-all duration-300",
                                                    isCollapsed ? "justify-center" : "",
                                                    isActive
                                                        ? "bg-zinc-950 text-white shadow-xl"
                                                        : "text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900"
                                                )}
                                            >
                                                <Icon className={cn("size-5 shrink-0 transition-transform", isActive ? "scale-110" : "")} />
                                                {!isCollapsed && (
                                                    <span className="animate-in fade-in slide-in-from-left-2 duration-300">
                                                        {item.name}
                                                    </span>
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className={cn("mt-auto space-y-1 pt-6 border-t border-zinc-200", isCollapsed ? "items-center" : "")}>
                    <button 
                        title={isCollapsed ? "Help Center" : ""}
                        className={cn(
                            "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900 transition-all",
                            isCollapsed ? "justify-center" : ""
                        )}
                    >
                        <HelpCircle className="size-5 shrink-0" />
                        {!isCollapsed && <span>Help Center</span>}
                    </button>
                    <button
                        onClick={handleLogout}
                        title={isCollapsed ? "Logout" : ""}
                        className={cn(
                            "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-all",
                            isCollapsed ? "justify-center" : ""
                        )}
                    >
                        <LogOut className="size-5 shrink-0" />
                        {!isCollapsed && <span>Logout</span>}
                    </button>
                </div>
            </div>
        </aside>
    );
}
