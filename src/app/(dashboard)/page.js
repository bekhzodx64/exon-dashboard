import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Clock,
  Package,
  ShieldCheck,
  TrendingUp,
  Users
} from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Welcome Section */}
      <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            Overview
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-[0.2em] text-[10px]">
            System status and knowledge center summary
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2 border border-zinc-100 shadow-sm dark:bg-zinc-950 dark:border-zinc-800">
            <div className="size-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest leading-none">All Systems Normal</span>
          </div>
          <div className="flex h-11 items-center gap-2 rounded-2xl bg-zinc-950 px-5 text-xs font-black text-white dark:bg-zinc-50 dark:text-black shadow-xl">
            Today: March 17
          </div>
        </div>
      </div>

      {/* Primary Analytics Section */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

        {/* Quick Link to Knowledge Base - Large Card */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-[3rem] bg-linear-to-br from-zinc-900 via-zinc-800 to-black p-10 text-white shadow-2xl dark:from-zinc-100 dark:to-zinc-200 dark:text-black">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md dark:bg-black/5">
                <BookOpen className="size-6" />
              </div>
              <h2 className="text-3xl font-black max-w-xs leading-tight">Explore the New Learning Modules.</h2>
              <p className="max-w-md text-zinc-400 dark:text-zinc-600 font-medium">
                All training materials for marketplace, shipping, and image editing are now updated and categorized.
              </p>
            </div>
            <Link
              href="/knowledge"
              className="mt-10 group inline-flex items-center gap-4 text-sm font-black uppercase tracking-widest text-orange-500 hover:text-orange-400 transition-colors"
            >
              Open Knowledge Base
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 group-hover:bg-orange-500 group-hover:text-white transition-all">
                <ArrowRight className="size-4" />
              </div>
            </Link>
          </div>
          {/* Decorative graphic */}
          <div className="absolute -right-20 -bottom-20 size-[32rem] opacity-20 dark:opacity-5">
            <Package className="size-full rotate-12" />
          </div>
        </div>

        {/* System Stats Block */}
        <div className="flex flex-col gap-6">
          {[
            { label: "Active Team", value: "148", sub: "Collaborators", icon: Users, color: "text-blue-500" },
            { label: "Uptime", value: "99.9%", sub: "Last 30 Days", icon: ShieldCheck, color: "text-green-500" },
            { label: "Avg Help Time", value: "24m", sub: "Response time", icon: Clock, color: "text-amber-500" },
          ].map((stat, i) => (
            <div key={i} className="flex flex-1 items-center gap-5 rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
              <div className={`p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 ${stat.color}`}>
                <stat.icon className="size-6" />
              </div>
              <div>
                <div className="text-2xl font-black tracking-tight">{stat.value}</div>
                <div className="text-[10px] uppercase font-black tracking-widest text-zinc-400">{stat.label}</div>
                <div className="text-[10px] font-bold text-zinc-300 uppercase leading-none mt-0.5">{stat.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Secondary Row: Recent Activity & Announcements */}
      <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-2">

        {/* Updates section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Recent Updates</h3>
            <button className="text-[10px] font-bold text-orange-600 hover:underline">View Log</button>
          </div>
          <div className="space-y-1">
            {[
              { title: "Marketplace SEO Guide", time: "2h ago", author: "Global Admin", color: "bg-blue-500" },
              { title: "New Shipping Policy", time: "Yesterday", author: "Shipping Admin", color: "bg-green-500" },
              { title: "Dashboard Redesign", time: "Mar 15", author: "System", color: "bg-zinc-500" },
            ].map((update, i) => (
              <div key={i} className="flex items-center justify-between rounded-2xl p-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900 group">
                <div className="flex items-center gap-4">
                  <div className={`size-2 rounded-full ${update.color} ring-4 ring-zinc-50 dark:ring-zinc-900 group-hover:ring-white dark:group-hover:ring-black`} />
                  <div>
                    <div className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{update.title}</div>
                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{update.author} • {update.time}</div>
                  </div>
                </div>
                <ArrowUpRight className="size-4 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
              </div>
            ))}
          </div>
        </div>

        {/* Global Message / Announcement */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-orange-600 p-8 text-white shadow-xl shadow-orange-600/20">
          <div className="relative z-10 space-y-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/10">
              <TrendingUp className="size-5 text-white/80" />
            </div>
            <h4 className="text-2xl font-black leading-tight">Company Progress.</h4>
            <p className="text-orange-100 font-medium">
              This month we reduced employee questions by 40% thanks to the new Knowledge Base. Keep up the documentation!
            </p>
            <div className="pt-4 flex items-center gap-3">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => <div key={i} className="size-8 rounded-full border-2 border-orange-600 bg-zinc-200" />)}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-80">+12 Contributors</span>
            </div>
          </div>
          <BookOpen className="absolute -right-12 -bottom-12 size-48 opacity-10 rotate-[-20deg]" />
        </div>
      </div>

    </div>
  );
}
