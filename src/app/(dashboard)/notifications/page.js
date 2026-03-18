"use client";

import { 
    Bell, 
    CheckCircle2, 
    AlertCircle, 
    Info, 
    ShieldAlert, 
    Trash2, 
    Check, 
    Loader2, 
    Megaphone,
    Send
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNotifications } from "@/components/NotificationProvider";
import { useSession } from "next-auth/react";

export default function NotificationsPage() {
    const { data: session } = useSession();
    const { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications } = useNotifications();
    
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const [broadcastData, setBroadcastData] = useState({
        title: "",
        message: "",
        type: "info",
        link: ""
    });
    const [broadcastMessage, setBroadcastMessage] = useState({ type: "", text: "" });

    const isGlobalAdmin = session?.user?.role === "global_admin";

    const handleBroadcast = async (e) => {
        e.preventDefault();
        setIsBroadcasting(true);
        setBroadcastMessage({ type: "", text: "" });

        try {
            const res = await fetch("/api/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(broadcastData)
            });

            if (!res.ok) throw new Error("Failed to broadcast notification");

            setBroadcastMessage({ type: "success", text: `Broadcast sent to all users!` });
            setBroadcastData({ title: "", message: "", type: "info", link: "" });
            fetchNotifications(); // Refresh local list
        } catch (err) {
            setBroadcastMessage({ type: "error", text: err.message });
        } finally {
            setIsBroadcasting(false);
        }
    };

    return (
        <div className="mx-auto max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tight text-zinc-900 md:text-5xl">
                        Notifications
                    </h1>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
                        Manage your alerts and system announcements
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button 
                        onClick={markAllAsRead}
                        className="h-11 px-6 rounded-2xl bg-zinc-100 text-zinc-600 font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center gap-2"
                    >
                        <Check className="size-4" />
                        Mark all as read
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Notifications List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="rounded-[2.5rem] border border-border bg-white overflow-hidden shadow-sm">
                        <div className="border-b border-zinc-100 p-6 flex items-center justify-between">
                            <h3 className="text-lg font-black flex items-center gap-3">
                                <Bell className="size-5 text-brand" />
                                Recent Activity
                            </h3>
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                Showing last 20
                            </span>
                        </div>

                        <div className="divide-y divide-zinc-50">
                            {notifications.length === 0 ? (
                                <div className="py-20 text-center flex flex-col items-center gap-3 opacity-30">
                                    <Bell className="size-12" />
                                    <p className="text-sm font-bold uppercase tracking-widest">Inbox is empty</p>
                                </div>
                            ) : (
                                notifications.map((n) => {
                                    const Icon = n.type === "success" ? CheckCircle2 : 
                                                 n.type === "warning" ? AlertCircle :
                                                 n.type === "error" ? ShieldAlert : Info;
                                    
                                    const iconColor = n.type === "success" ? "bg-green-50 text-green-600" :
                                                      n.type === "warning" ? "bg-orange-50 text-orange-600" :
                                                      n.type === "error" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600";

                                    return (
                                        <div 
                                            key={n.id}
                                            onClick={() => markAsRead(n.id)}
                                            className={`group flex gap-5 p-8 transition-all cursor-pointer ${!n.isRead ? 'bg-zinc-50/50' : 'hover:bg-zinc-50'}`}
                                        >
                                            <div className={`mt-1 h-12 w-12 shrink-0 flex items-center justify-center rounded-2xl ${iconColor}`}>
                                                <Icon className="size-6" />
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-start justify-between">
                                                    <p className={`text-base font-black leading-snug ${!n.isRead ? 'text-zinc-900' : 'text-zinc-500'}`}>
                                                        {n.title}
                                                    </p>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                                        {new Date(n.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className={`text-sm leading-relaxed ${!n.isRead ? 'text-zinc-600' : 'text-zinc-400'}`}>
                                                    {n.message}
                                                </p>
                                                {!n.isRead && (
                                                    <div className="pt-2">
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 text-brand text-[9px] font-black uppercase tracking-widest">
                                                            <div className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
                                                            New Alert
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar / Admin Broadcast */}
                <div className="space-y-8">
                    {/* Stats Card */}
                    <div className="rounded-[2.5rem] bg-zinc-900 p-8 text-white shadow-xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">Notification Status</h4>
                            <div className="text-5xl font-black mb-1">{unreadCount}</div>
                            <p className="text-zinc-400 text-sm font-bold uppercase tracking-widest">Unread Alerts</p>
                        </div>
                        <Bell className="absolute -right-4 -bottom-4 size-32 opacity-5 group-hover:scale-110 transition-transform duration-700" />
                    </div>

                    {/* Admin Actions */}
                    {isGlobalAdmin && (
                        <div className="rounded-[2.5rem] border border-border bg-white p-8 shadow-sm space-y-6">
                            <h3 className="text-xl font-black flex items-center gap-3">
                                <Megaphone className="size-5 text-brand" />
                                Broadcast
                            </h3>
                            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                                Send a global notification to all system users. Use for urgent updates or server maintenance news.
                            </p>

                            <form onSubmit={handleBroadcast} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Title</label>
                                    <input 
                                        type="text"
                                        required
                                        value={broadcastData.title}
                                        onChange={e => setBroadcastData({...broadcastData, title: e.target.value})}
                                        placeholder="Maintenance alert"
                                        className="h-12 w-full rounded-2xl bg-zinc-50 border border-zinc-100 px-4 text-xs font-bold outline-none focus:border-brand"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Message</label>
                                    <textarea 
                                        required
                                        value={broadcastData.message}
                                        onChange={e => setBroadcastData({...broadcastData, message: e.target.value})}
                                        placeholder="The system will be offline for 10 minutes..."
                                        className="min-h-[100px] w-full rounded-2xl bg-zinc-50 border border-zinc-100 p-4 text-xs font-bold outline-none focus:border-brand resize-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Alert Type</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['info', 'success', 'warning', 'error'].map(type => (
                                            <button 
                                                key={type}
                                                type="button"
                                                onClick={() => setBroadcastData({...broadcastData, type})}
                                                className={`h-10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                                                    broadcastData.type === type 
                                                    ? 'bg-zinc-900 text-white shadow-lg' 
                                                    : 'bg-zinc-50 text-zinc-400 hover:bg-zinc-100'
                                                }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                {broadcastMessage.text && (
                                    <div className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest ${
                                        broadcastMessage.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                    }`}>
                                        {broadcastMessage.text}
                                    </div>
                                )}

                                <button 
                                    disabled={isBroadcasting}
                                    className="w-full h-14 bg-brand text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand/20 hover:scale-[1.02] active:scale-100 transition-all flex items-center justify-center gap-3"
                                >
                                    {isBroadcasting ? <Loader2 className="animate-spin" /> : <Send className="size-4" />}
                                    Send Broadcast
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
