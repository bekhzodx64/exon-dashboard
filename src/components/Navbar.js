"use client";

import { Bell, ChevronDown, Search, User, CheckCircle2, AlertCircle, Info, ShieldAlert, X, Settings, LogOut, MessageSquare } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { useNotifications } from "./NotificationProvider";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Navbar() {
    const { data: session } = useSession();
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [isNotifyOpen, setIsNotifyOpen] = useState(false);
    const notifyRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (notifyRef.current && !notifyRef.current.contains(event.target)) {
                setIsNotifyOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const username = session?.user?.name || "User";
    const role = session?.user?.role || "employee";

    return (
        <header className="sticky top-0 z-30 h-16 w-full border-b border-zinc-100 bg-white/80 px-6 backdrop-blur-md">
            <div className="flex h-full items-center justify-between">
                {/* Search */}
                <div className="flex flex-1 items-center px-4">
                    <div className="relative group w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 mt-0 size-4 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-zinc-600" />
                        <input
                            type="search"
                            placeholder="Search knowledge base..."
                            className="h-10 w-full rounded-full border border-zinc-200 bg-zinc-50 pl-10 pr-4 text-sm font-medium outline-none ring-brand/10 transition-all focus:border-brand/40 focus:ring-4"
                        />
                    </div>
                </div>

                {/* User Options */}
                <div className="flex items-center gap-4">
                    {/* Notifications Bell */}
                    <div className="relative" ref={notifyRef}>
                        <button 
                            onClick={() => setIsNotifyOpen(!isNotifyOpen)}
                            className={`relative rounded-xl p-2.5 transition-all hover:bg-zinc-100 ${isNotifyOpen ? 'bg-zinc-100 text-brand' : 'text-zinc-500 hover:text-zinc-700'}`}
                        >
                            <Bell className="size-5" />
                            {unreadCount > 0 && (
                                <span className="absolute right-1.5 top-1.5 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-red-600 px-0.5 text-[9px] font-black text-white ring-2 ring-white">
                                    {unreadCount > 99 ? "99+" : unreadCount}
                                </span>
                            )}
                        </button>

                        <AnimatePresence>
                            {isNotifyOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-3 w-80 z-20 overflow-hidden rounded-4xl border border-border bg-white shadow-2xl"
                                >
                                        <div className="flex items-center justify-between border-b border-zinc-100 p-5">
                                            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900">Notifications</h3>
                                            {unreadCount > 0 && (
                                                <button 
                                                    onClick={markAllAsRead}
                                                    className="text-[10px] font-black uppercase tracking-widest text-brand hover:underline"
                                                >
                                                    Mark all read
                                                </button>
                                            )}
                                        </div>

                                        <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                                            {notifications.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center py-10 text-center opacity-50">
                                                    <Bell className="mb-2 size-8 text-zinc-300" />
                                                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">All caught up!</p>
                                                </div>
                                            ) : (
                                                notifications.map((n) => {
                                                    const Icon = n.type === "success" ? CheckCircle2 : 
                                                                 n.type === "warning" ? AlertCircle :
                                                                 n.type === "error" ? ShieldAlert : Info;
                                                    
                                                    const iconColor = n.type === "success" ? "text-green-500" :
                                                                      n.type === "warning" ? "text-orange-500" :
                                                                      n.type === "error" ? "text-red-500" : "text-blue-500";

                                                    return (
                                                        <div 
                                                            key={n.id}
                                                            onClick={() => markAsRead(n.id)}
                                                            className={`relative flex gap-4 border-b border-zinc-50 p-5 transition-colors cursor-pointer hover:bg-zinc-50 ${!n.isRead ? 'bg-zinc-50/50' : ''}`}
                                                        >
                                                            <div className={`mt-1 shrink-0 ${iconColor}`}>
                                                                <Icon className="size-5" />
                                                            </div>
                                                            <div className="flex-1 space-y-1">
                                                                <p className={`text-xs font-bold leading-tight ${!n.isRead ? 'text-zinc-900' : 'text-zinc-600'}`}>
                                                                    {n.title}
                                                                </p>
                                                                <p className="text-[11px] leading-normal text-zinc-500 line-clamp-2">
                                                                    {n.message}
                                                                </p>
                                                                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                                                                    {new Date(n.createdAt).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                            {!n.isRead && (
                                                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                                    <div className="h-2 w-2 rounded-full bg-brand" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>

                                        <div className="bg-zinc-50 p-4 text-center">
                                            <Link 
                                                href="/notifications"
                                                onClick={() => setIsNotifyOpen(false)}
                                                className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors"
                                            >
                                                View all activity
                                            </Link>
                                        </div>
                                    </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="h-8 w-px bg-zinc-200" />

                    <div className="flex items-center gap-3 px-2 py-1.5 transition-all">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-brand to-brand/60 text-white shadow-lg shadow-brand/20">
                            <User className="size-5" />
                        </div>
                        <div className="hidden text-left md:block">
                            <div className="text-sm font-semibold leading-none text-zinc-900">{username}</div>
                            <div className="mt-1 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                {role.replace("_", " ")}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
