"use client";

import { 
    Check, 
    KeyRound, 
    Loader2, 
    Mail, 
    Save, 
    ShieldCheck, 
    User, 
    UserCircle 
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function SettingsPage() {
    const { data: session, update } = useSession();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    useEffect(() => {
        if (session?.user) {
            setFormData(prev => ({
                ...prev,
                name: session.user.name || "",
                email: session.user.email || "",
            }));
        }
    }, [session]);

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            const res = await fetch(`/api/users/${session.user.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    role: session.user.role, // Keep existing role
                    ...(formData.password && { password: formData.password })
                }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to update settings");

            setMessage({ type: "success", text: "Settings updated successfully!" });
            setFormData(prev => ({ ...prev, password: "" }));
            
            // Update session data
            await update({
                ...session,
                user: {
                    ...session.user,
                    name: formData.name,
                    email: formData.email,
                }
            });

        } catch (err) {
            setMessage({ type: "error", text: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="space-y-1">
                <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                    Account Settings
                </h1>
                <p className="text-zinc-500 dark:text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
                    Manage your personal profile and security preferences
                </p>
            </div>

            {message.text && (
                <div className={`p-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3 animate-in fade-in zoom-in-95 duration-300 ${
                    message.type === 'success' 
                    ? 'bg-green-50 text-green-600 dark:bg-green-900/10 dark:text-green-400' 
                    : 'bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400'
                }`}>
                    {message.type === 'success' ? <Check className="size-4" /> : <ShieldCheck className="size-4" />}
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Profile Overview Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="rounded-[2.5rem] border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950 shadow-sm transition-all hover:shadow-md">
                        <div className="flex flex-col items-center text-center">
                            <div className="relative mb-4">
                                <div className="h-24 w-24 rounded-full bg-linear-to-br from-orange-500 to-amber-600 p-1 shadow-xl shadow-orange-500/20">
                                    <div className="flex h-full w-full items-center justify-center rounded-full bg-white dark:bg-zinc-950">
                                        <UserCircle className="size-16 text-zinc-200 dark:text-zinc-800" />
                                    </div>
                                </div>
                                <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-2xl bg-zinc-950 text-white flex items-center justify-center dark:bg-white dark:text-black shadow-lg">
                                    <ShieldCheck className="size-4" />
                                </div>
                            </div>
                            <h2 className="text-xl font-black tracking-tight">{session?.user?.name}</h2>
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">
                                {session?.user?.role?.replace('_', ' ')}
                            </p>
                        </div>

                        <div className="mt-8 space-y-4 pt-6 border-t border-zinc-100 dark:border-zinc-900">
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                <span>Status</span>
                                <span className="text-green-500">Active</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                <span>Joined</span>
                                <span className="text-zinc-900 dark:text-zinc-50">March 2024</span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[2rem] bg-zinc-50 p-6 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/50">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Need help?</h4>
                        <p className="text-xs text-zinc-500 leading-relaxed">
                            If you need to change your role or department, please contact your **Global Administrator**.
                        </p>
                    </div>
                </div>

                {/* Main Settings Form */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSave} className="space-y-8">
                        {/* Personal Information */}
                        <div className="rounded-[2.5rem] border border-zinc-200 bg-white p-10 dark:border-zinc-800 dark:bg-zinc-950 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                                <User className="size-32" />
                            </div>
                            
                            <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                                <User className="size-5 text-orange-500" />
                                Personal Information
                            </h3>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="h-12 w-full rounded-2xl border border-zinc-100 bg-zinc-50 pl-11 pr-4 text-sm font-bold outline-none focus:border-zinc-300 dark:border-zinc-900 dark:bg-zinc-900 dark:focus:border-zinc-800"
                                            placeholder="Alexander Smith"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="h-12 w-full rounded-2xl border border-zinc-100 bg-zinc-50 pl-11 pr-4 text-sm font-bold outline-none focus:border-zinc-300 dark:border-zinc-900 dark:bg-zinc-900 dark:focus:border-zinc-800"
                                            placeholder="alex@exon.com"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security */}
                        <div className="rounded-[2.5rem] border border-zinc-200 bg-white p-10 dark:border-zinc-800 dark:bg-zinc-950 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                                <KeyRound className="size-32" />
                            </div>
                            
                            <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                                <KeyRound className="size-5 text-orange-500" />
                                Security
                            </h3>

                            <div className="space-y-2 max-w-md">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Change Password</label>
                                <div className="relative">
                                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="h-12 w-full rounded-2xl border border-zinc-100 bg-zinc-50 pl-11 pr-4 text-sm font-bold outline-none focus:border-zinc-300 dark:border-zinc-900 dark:bg-zinc-900 dark:focus:border-zinc-800"
                                        placeholder="Enter new password (optional)"
                                        autoComplete="new-password"
                                    />
                                </div>
                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest px-1">Leave empty to keep current password</p>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="h-14 min-w-[200px] rounded-2xl bg-zinc-950 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:translate-y-[-2px] active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:opacity-70 dark:bg-zinc-100 dark:text-black"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <Save className="size-4" />}
                                {loading ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
