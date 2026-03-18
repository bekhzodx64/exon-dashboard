"use client";

import { 
    Check, 
    KeyRound, 
    Loader2, 
    Mail, 
    Save, 
    ShieldCheck, 
    User, 
    UserCircle,
    Palette,
    ArrowLeft,
    ChevronRight,
    History,
    Monitor,
    Globe,
    Smartphone,
    Tablet,
    Settings
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function SettingsPage() {
    const { data: session, update } = useSession();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [mounted, setMounted] = useState(false);
    const [activeSection, setActiveSection] = useState("overview"); // overview, profile, appearance, security, history
    const [loginHistory, setLoginHistory] = useState([]);
    const [fetchingHistory, setFetchingHistory] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        brandColor: "234 88 12", // Default orange-600
    });

    useEffect(() => {
        setMounted(true);
        if (session?.user) {
            setFormData(prev => ({
                ...prev,
                name: session.user.name || "",
                email: session.user.email || "",
                brandColor: session.user.brandColor || "234 88 12",
            }));
        }
    }, [session]);

    const fetchLoginHistory = async () => {
        setFetchingHistory(true);
        try {
            const res = await fetch("/api/auth/history");
            const data = await res.json();
            if (res.ok) setLoginHistory(data);
        } catch (err) {
            console.error("Failed to fetch history", err);
        } finally {
            setFetchingHistory(false);
        }
    };

    useEffect(() => {
        if (session?.user) {
            fetchLoginHistory();
        }
    }, [activeSection, session]);

    const colors = [
        { name: "Orange", value: "234 88 12" },
        { name: "Blue", value: "37 99 235" },
        { name: "Purple", value: "147 51 234" },
        { name: "Green", value: "22 163 74" },
        { name: "Rose", value: "225 29 72" },
    ];

    const changeBrandColor = (colorValue) => {
        setFormData(prev => ({ ...prev, brandColor: colorValue }));
        document.documentElement.style.setProperty('--brand-color', colorValue);
    };

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
                    role: session.user.role,
                    brandColor: formData.brandColor,
                    ...(formData.password && { password: formData.password })
                }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to update settings");

            setMessage({ type: "success", text: "Settings updated successfully!" });
            setFormData(prev => ({ ...prev, password: "" }));
            
            await update({
                ...session,
                user: {
                    ...session.user,
                    name: formData.name,
                    email: formData.email,
                    brandColor: formData.brandColor,
                }
            });

        } catch (err) {
            setMessage({ type: "error", text: err.message });
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) return null;

    const sections = [
        {
            id: "profile",
            title: "Personal Profile",
            desc: "Update your name, email and public information.",
            icon: User,
            color: "bg-blue-600",
        },
        {
            id: "appearance",
            title: "Brand Appearance",
            desc: "Customize your dashboard primary accent color.",
            icon: Palette,
            color: "bg-purple-600",
        },
        {
            id: "security",
            title: "Account Security",
            desc: "Manage your password and security keys.",
            icon: KeyRound,
            color: "bg-brand",
        },
        {
            id: "history",
            title: "Sign-in History",
            desc: "Monitor your session locations and device list.",
            icon: History,
            color: "bg-zinc-800",
        }
    ];

    return (
        <div className="mx-auto max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                         {activeSection !== "overview" && (
                            <button 
                                onClick={() => setActiveSection("overview")}
                                className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 border border-zinc-200 transition-transform active:scale-90"
                            >
                                <ArrowLeft className="size-4" />
                            </button>
                        )}
                        <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] flex items-center gap-1">
                            <Settings className="size-3" />
                            System Settings
                            {activeSection !== "overview" && (
                                <>
                                    <ChevronRight className="size-3" />
                                    {activeSection}
                                </>
                            )}
                        </span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-zinc-900 md:text-5xl">
                        {activeSection === "overview" ? "Settings" : sections.find(s => s.id === activeSection).title}
                    </h1>
                </div>

                {activeSection !== "overview" && (
                    <div className="flex gap-3">
                         <button
                            onClick={() => setActiveSection("overview")}
                            className="h-11 px-6 rounded-2xl bg-zinc-100 text-zinc-600 font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="h-11 px-8 rounded-2xl bg-brand text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-brand/20 hover:translate-y-[-2px] active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="animate-spin size-4" /> : <Save className="size-4" />}
                            Save
                        </button>
                    </div>
                )}
            </div>

            {message.text && (
                <div className={`p-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3 animate-in fade-in zoom-in-95 duration-300 ${
                    message.type === 'success' 
                    ? 'bg-green-50 text-green-600' 
                    : 'bg-red-50 text-red-600'
                }`}>
                    {message.type === 'success' ? <Check className="size-4" /> : <ShieldCheck className="size-4" />}
                    {message.text}
                </div>
            )}

            {activeSection === "overview" ? (
                /* Overview Grid - Styled like Knowledge Base */
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {sections.map((section) => {
                        const Icon = section.icon;
                        return (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className="group relative flex flex-col items-start overflow-hidden rounded-[2.5rem] border border-border bg-white p-8 text-left transition-all hover:-translate-y-2 hover:border-brand/50 hover:shadow-2xl hover:shadow-brand/10"
                            >
                                <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${section.color} text-white shadow-lg transition-transform group-hover:scale-110 duration-500`}>
                                    <Icon className="size-7" />
                                </div>
                                <h3 className="text-xl font-black tracking-tight text-zinc-900">
                                    {section.title}
                                </h3>
                                <p className="mt-2 text-sm text-zinc-500 group-hover:text-zinc-600 transition-colors">
                                    {section.desc}
                                </p>
                                
                                <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand opacity-0 translate-x-4 transition-all group-hover:opacity-100 group-hover:translate-x-0">
                                    Configure
                                    <ChevronRight className="size-3" />
                                </div>

                                {/* Absolute Background Glow */}
                                <div className={`absolute -right-4 -bottom-4 size-24 opacity-5 transition-transform group-hover:scale-150 duration-700 ${section.color} blur-2xl`} />
                            </button>
                        );
                    })}

                    <div className="md:col-span-3 mt-4 rounded-[2.5rem] bg-zinc-50 p-8 border border-border flex flex-col md:flex-row items-center gap-6">
                        <div className="h-20 w-20 rounded-full bg-linear-to-br from-brand to-brand/60 p-1">
                            <div className="h-full w-full rounded-full bg-white flex items-center justify-center">
                                <UserCircle className="size-12 text-zinc-200" />
                            </div>
                        </div>
                        <div className="text-center md:text-left">
                            <h2 className="text-2xl font-black">{session?.user?.name}</h2>
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">
                                {session?.user?.role?.replace('_', ' ')} • Active Session
                            </p>
                        </div>
                        <div className="ms-auto flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Security Score</div>
                                <div className="text-sm font-bold text-green-500">Strong</div>
                            </div>
                            <div className="h-10 w-[2px] bg-zinc-200 hidden sm:block" />
                            <div className="text-right hidden lg:block min-w-32">
                                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Last Login</div>
                                <div className="text-sm font-bold text-zinc-900">
                                    {loginHistory[0] ? new Date(loginHistory[0].createdAt).toLocaleString([], {
                                        day: '2-digit',
                                        month: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    }) : 'N/A'}
                                </div>
                            </div>
                            <div className="h-10 w-[2px] bg-zinc-200 hidden lg:block" />
                            <button 
                                onClick={() => setActiveSection("profile")}
                                className="px-6 h-12 rounded-2xl bg-zinc-900 text-white font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
                            >
                                Quick Edit
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                /* Individual Section Views */
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    {activeSection === "profile" && (
                        <div className="rounded-[2.5rem] border border-border bg-white p-10 shadow-sm">
                            <h3 className="text-2xl font-black mb-8 flex items-center gap-4 text-zinc-950">
                                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-600 text-white">
                                    <User className="size-5" />
                                </div>
                                Profile Details
                            </h3>

                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="h-14 w-full rounded-2xl border border-border bg-zinc-50 pl-12 pr-4 text-sm font-bold outline-none focus:border-brand"
                                            placeholder="Alexander Smith"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="h-14 w-full rounded-2xl border border-border bg-zinc-50 pl-12 pr-4 text-sm font-bold outline-none focus:border-brand"
                                            placeholder="alex@exon.com"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === "appearance" && (
                        <div className="rounded-[2.5rem] border border-border bg-white p-10 shadow-sm">
                            <h3 className="text-2xl font-black mb-8 flex items-center gap-4 text-zinc-950">
                                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-purple-600 text-white">
                                    <Palette className="size-5" />
                                </div>
                                Main Accent Color
                            </h3>
                            <p className="text-sm text-zinc-500 mb-8 max-w-md">
                                This color will be applied across the entire dashboard to buttons, active menu items, and primary interactions.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                {colors.map((color) => (
                                    <button
                                        key={color.value}
                                        type="button"
                                        onClick={() => changeBrandColor(color.value)}
                                        className={`group relative h-16 w-16 rounded-3xl transition-all duration-300 ${
                                            formData.brandColor === color.value ? 'scale-110 shadow-2xl ring-4 ring-white' : 'hover:scale-105 opacity-60 hover:opacity-100 shadow-lg'
                                        }`}
                                        style={{ backgroundColor: `rgb(${color.value})` }}
                                    >
                                        {formData.brandColor === color.value && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Check className="size-6 text-white" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeSection === "security" && (
                        <div className="rounded-[2.5rem] border border-border bg-white p-10 shadow-sm">
                            <h3 className="text-2xl font-black mb-8 flex items-center gap-4 text-zinc-950">
                                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-orange-600 text-white">
                                    <KeyRound className="size-5" />
                                </div>
                                Security Settings
                            </h3>

                            <div className="space-y-6 max-w-md">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Update Password</label>
                                    <div className="relative">
                                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="h-14 w-full rounded-2xl border border-border bg-zinc-50 pl-12 pr-4 text-sm font-bold outline-none focus:border-brand"
                                            placeholder="Enter new master password"
                                            autoComplete="new-password"
                                        />
                                    </div>
                                    <p className="text-[10px] font-bold text-red-500/60 uppercase tracking-widest px-1">Requires 8+ characters for strong protection</p>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeSection === "history" && (
                        <div className="rounded-[2.5rem] border border-border bg-white p-10 shadow-sm animate-in fade-in slide-in-from-right-4 duration-500">
                             <div className="flex items-center justify-between mb-8">
                                <h3 className="text-2xl font-black flex items-center gap-4 text-zinc-950">
                                     <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-zinc-900 text-white">
                                         <History className="size-5" />
                                     </div>
                                     Sign-in History
                                 </h3>
                                 <button 
                                     onClick={fetchLoginHistory}
                                     disabled={fetchingHistory}
                                     className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-brand transition-colors disabled:opacity-50"
                                 >
                                     {fetchingHistory ? "Refreshing..." : "Refresh List"}
                                 </button>
                            </div>

                            <div className="space-y-4">
                                {loginHistory.length === 0 && !fetchingHistory && (
                                    <div className="py-20 text-center space-y-4">
                                        <div className="mx-auto h-16 w-16 rounded-full bg-zinc-50 flex items-center justify-center">
                                            <Monitor className="size-8 text-zinc-200" />
                                        </div>
                                        <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">No login history found</p>
                                    </div>
                                )}

                                {loginHistory.map((item, idx) => {
                                    const date = new Date(item.createdAt);
                                    const timeStr = date.toLocaleString();
                                    
                                    // Icon logic
                                    let DeviceIcon = Monitor;
                                    if (item.device?.toLowerCase().includes('mobile')) DeviceIcon = Smartphone;
                                    if (item.device?.toLowerCase().includes('tablet')) DeviceIcon = Tablet;

                                    return (
                                        <div 
                                            key={item.id} 
                                            className="group flex items-center gap-6 p-6 rounded-3xl border border-border hover:border-brand/20 hover:bg-zinc-50/50 transition-all"
                                        >
                                            <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-zinc-100 group-hover:bg-brand/10 group-hover:text-brand transition-colors">
                                                <DeviceIcon className="size-6" />
                                            </div>
                                            
                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Device & Browser</p>
                                                    <p className="text-sm font-bold text-zinc-900">{item.os} • {item.browser}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">IP Address</p>
                                                    <p className="text-sm font-bold text-zinc-600 flex items-center gap-2">
                                                        <Globe className="size-3" />
                                                        {item.ip}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Login Time</p>
                                                    <p className="text-sm font-bold text-zinc-600">{timeStr}</p>
                                                </div>
                                            </div>

                                            {idx === 0 && (
                                                <div className="hidden sm:block">
                                                    <span className="px-3 py-1.5 rounded-full bg-green-100 text-green-600 text-[10px] font-black uppercase tracking-widest">Current</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            
                            <p className="mt-8 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">
                                Showing last 20 login attempts. If you see unrecognized activity, change your password immediately.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
