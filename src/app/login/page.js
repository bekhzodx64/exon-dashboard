"use client";

import { motion } from "framer-motion";
import { ArrowRight, Globe, Lock, Mail, ShieldCheck, Zap } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
    const [email, setEmail] = useState("bekhzod@mail.ru");
    const [password, setPassword] = useState("123456");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError("");

        console.log("LOGIN_CLIENT: Starting sign-in for", email);

        try {
            const result = await signIn("credentials", {
                email: email,
                password: password,
                redirect: false,
            });

            console.log("LOGIN_CLIENT: Result received:", result);

            if (result?.error) {
                setError(result.error === "CredentialsSignin" ? "Invalid email or password" : result.error);
            } else if (result?.ok) {
                router.push("/");
                router.refresh();
            }
        } catch (err) {
            setError("Something went wrong. Please check console.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-white text-zinc-900 dark:bg-black dark:text-white flex items-center justify-center p-4">

            {/* Animated Background Gradients */}
            <div className="absolute top-0 -left-4 w-72 h-72 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob dark:opacity-10" />
            <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 dark:opacity-10" />
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 dark:opacity-10" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="bg-white/70 backdrop-blur-2xl border border-zinc-200 dark:bg-zinc-950/70 dark:border-zinc-800 p-10 rounded-[2.5rem] shadow-2xl">

                    {/* Brand / Logo */}
                    <div className="flex flex-col items-center mb-10 space-y-4">
                        <div className="h-16 w-16 bg-linear-to-br from-orange-500 to-orange-700 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-500/30">
                            <ShieldCheck className="size-8 text-white" />
                        </div>
                        <div className="text-center">
                            <h1 className="text-3xl font-black tracking-tighter uppercase italic">EXON</h1>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">Corporate Authentication</p>
                        </div>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold uppercase tracking-wider text-center dark:bg-red-900/10 dark:border-red-900/20"
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-400 group-focus-within:text-orange-500 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="off"
                                    autoCorrect="off"
                                    autoCapitalize="off"
                                    spellCheck="false"
                                    placeholder="your@email.com"
                                    className="w-full h-14 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl pl-12 pr-4 text-sm font-bold outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5 transition-all text-zinc-900 dark:text-zinc-50"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1 flex justify-between items-center">
                                Password
                                <span className="text-[9px] cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">Forgot Password?</span>
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-400 group-focus-within:text-orange-500 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="new-password"
                                    spellCheck="false"
                                    placeholder="••••••••"
                                    className="w-full h-14 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl pl-12 pr-4 text-sm font-bold outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5 transition-all text-zinc-900 dark:text-zinc-50"
                                />
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full h-14 bg-zinc-950 dark:bg-white dark:text-black text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:translate-y-[-2px] active:translate-y-0 transition-all flex items-center justify-center gap-3 group disabled:opacity-70 disabled:translate-y-0"
                        >
                            {loading ? "Authenticating..." : "Sign Into Dashboard"}
                            {!loading && <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    <div className="mt-10 pt-10 border-t border-zinc-100 dark:border-zinc-900 grid grid-cols-3 gap-4">
                        {[
                            { icon: ShieldCheck, label: "Secure" },
                            { icon: Globe, label: "Global" },
                            { icon: Zap, label: "Fast" },
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col items-center gap-2 opacity-40 hover:opacity-100 transition-opacity">
                                <item.icon className="size-4" />
                                <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="text-center mt-8 text-zinc-400 dark:text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
                    Internal Use Only • Authorized Access Required
                </p>
            </motion.div>
        </div>
    );
}
