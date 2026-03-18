"use client";

import { Bell, ChevronDown, Search, User } from "lucide-react";
import { useSession } from "next-auth/react";

export default function Navbar() {
    const { data: session } = useSession();
    const username = session?.user?.name || "User";
    const role = session?.user?.role || "employee";
    return (
        <header className="sticky top-0 z-30 h-16 w-full border-b border-border bg-white/80 px-6 backdrop-blur-md">
            <div className="flex h-full items-center justify-between">
                {/* Search */}
                <div className="flex flex-1 items-center px-4">
                    <div className="relative group w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 mt-0 size-4 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-zinc-600" />
                        <input
                            type="search"
                            placeholder="Search knowledge base..."
                            className="h-10 w-full rounded-full border border-border bg-zinc-50 pl-10 pr-4 text-sm font-medium outline-none ring-brand/10 transition-all focus:border-brand/40 focus:ring-4"
                        />
                    </div>
                </div>

                {/* User Options */}
                <div className="flex items-center gap-4">
                    <button className="relative rounded-xl p-2.5 text-zinc-500 transition-all hover:bg-zinc-100 hover:text-zinc-700">
                        <Bell className="size-5" />
                        <span className="absolute right-3 top-3 ring-2 ring-white flex h-1.5 w-1.5 rounded-full bg-red-600" />
                    </button>

                    <div className="h-8 w-px bg-border" />

                    <button className="flex items-center gap-3 rounded-2xl p-1.5 text-zinc-700 transition-all hover:bg-zinc-50">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-brand to-brand/60 text-white shadow-lg shadow-brand/20">
                            <User className="size-5" />
                        </div>
                        <div className="hidden text-left md:block">
                            <div className="text-sm font-semibold leading-none">{username}</div>
                            <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 opacity-60">
                                {role.replace("_", " ")}
                            </div>
                        </div>
                        <ChevronDown className="hidden size-4 text-zinc-400 md:block" />
                    </button>
                </div>
            </div>
        </header>
    );
}
