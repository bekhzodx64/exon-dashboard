"use client";

import { Search, User } from "lucide-react";
import { useSession } from "next-auth/react";

export default function Navbar() {
    const { data: session } = useSession();


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
