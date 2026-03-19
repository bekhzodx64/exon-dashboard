"use client";

import {
    AnimatePresence,
    motion
} from "framer-motion";
import {
    AlertCircle,
    Check,
    Clock,
    Loader2,
    Pencil,
    Search,
    ShieldAlert,
    Trash2,
    UserCheck2,
    UserPlus,
    Users,
    X
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export default function UserManagement() {
    const { data: session } = useSession();
    const currentUser = session?.user;

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });

    // Modal state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [accessUser, setAccessUser] = useState(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [customMinutes, setCustomMinutes] = useState("");
    const [now, setNow] = useState(new Date());

    // Form states
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "employee"
    });
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState("");

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/users");
            if (!res.ok) throw new Error("Failed to fetch users");
            const data = await res.json();
            setUsers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateAccess = async (user, minutes) => {
        setFormLoading(true);
        try {
            const res = await fetch(`/api/admin/users/${user.id}/access`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ durationMinutes: minutes }),
            });
            if (!res.ok) throw new Error("Failed to update access");
            
            setIsAccessModalOpen(false);
            fetchUsers();
            showToast(`Access updated for ${user.name}`, "success");
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setFormLoading(false);
        }
    };

    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => setToast({ ...toast, show: false }), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);

    // Live countdown timer effect for the whole table
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTimeRemaining = (expiryDate) => {
        if (!expiryDate) return "Unlimited";
        const diff = new Date(expiryDate) - now;
        if (diff <= 0) return "Expired";

        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        return `${hours > 0 ? `${hours}h ` : ""}${minutes}m ${seconds}s`;
    };

    const showToast = (message, type = "success") => {
        setToast({ show: true, message, type });
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const resetForm = () => {
        setFormData({ name: "", email: "", password: "", role: "employee" });
        setFormError("");
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError("");

        try {
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to create user");

            setIsAddModalOpen(false);
            resetForm();
            fetchUsers();
        } catch (err) {
            setFormError(err.message);
        } finally {
            setFormLoading(false);
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError("");

        try {
            const res = await fetch(`/api/users/${selectedUser.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    role: formData.role,
                    // Only send password if it's purposefully being changed
                    ...(formData.password && { password: formData.password })
                }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to update user");

            setIsEditModalOpen(false);
            setSelectedUser(null);
            resetForm();
            fetchUsers();
        } catch (err) {
            setFormError(err.message);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteUser = async () => {
        setFormLoading(true);
        try {
            const res = await fetch(`/api/users/${userToDelete.id}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to delete user");
            }
            setIsDeleteConfirmOpen(false);
            setUserToDelete(null);
            fetchUsers();
            showToast("User deleted successfully", "success");
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setFormLoading(false);
        }
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setFormData({
            name: user.name || "",
            email: user.email || "",
            password: "",
            role: user.role
        });
        setIsEditModalOpen(true);
    };

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="mx-auto max-w-7xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header section */}
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tight text-zinc-900">
                        User Management
                    </h1>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
                        Manage accounts, roles and access permissions
                    </p>
                </div>

                <button
                    onClick={() => { resetForm(); setIsAddModalOpen(true); }}
                    className="group flex h-12 items-center gap-2 rounded-2xl bg-zinc-950 px-6 font-bold text-white shadow-xl transition-all hover:scale-105 active:scale-95"
                >
                    <UserPlus className="size-5 transition-transform group-hover:rotate-12" />
                    Create New Account
                </button>
            </div>

            {/* Stats row - Linked to real data */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                {[
                    { label: "Total Users", value: users.length, icon: Users, color: "text-blue-500" },
                    { label: "Global Admins", value: users.filter(u => u.role === 'global_admin').length, icon: ShieldAlert, color: "text-red-500" },
                    { label: "Admins", value: users.filter(u => u.role === 'admin').length, icon: UserCheck2, color: "text-green-500" },
                    { label: "Employees", value: users.filter(u => u.role === 'employee').length, icon: Clock, color: "text-brand" },
                ].map((stat, i) => (
                    <div key={i} className="rounded-3xl border border-border bg-white p-6 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 ${stat.color}`}>
                                <stat.icon className="size-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Live stats</span>
                        </div>
                        <div className="text-2xl font-black tracking-tight">{stat.value}</div>
                        <div className="text-sm font-bold text-zinc-500 mt-1 uppercase tracking-widest text-[9px]">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Main Table section */}
            <div className="overflow-hidden rounded-[2.5rem] border border-border bg-white shadow-xl shadow-zinc-200/50">
                <div className="border-b border-zinc-100 p-6 dark:border-zinc-900">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="off"
                                spellCheck="false"
                                placeholder="Search by name, email or role..."
                                className="h-11 w-full rounded-2xl border border-zinc-100 bg-zinc-50 pl-11 pr-4 text-sm font-bold outline-none focus:border-zinc-300 dark:border-zinc-900 dark:bg-zinc-900 dark:focus:border-zinc-800"
                            />
                        </div>
                        <button
                            onClick={fetchUsers}
                            className="flex items-center gap-2 rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-2.5 text-xs font-bold text-zinc-600 dark:border-zinc-900 dark:bg-zinc-900 dark:text-zinc-400 hover:bg-zinc-100 transition-colors"
                        >
                            Refresh
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-zinc-50/50 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                <th className="px-8 py-5">Full Name & Email</th>
                                <th className="px-8 py-5">System Role</th>
                                <th className="px-8 py-5">Last Login</th>
                                <th className="px-8 py-5">Access Status</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-10 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="size-6 animate-spin text-brand" />
                                            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Loading Users...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-10 text-center text-zinc-400 font-bold uppercase tracking-widest text-xs">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-zinc-900 dark:text-zinc-50">{user.name || "Unnamed"}</span>
                                                <span className="text-xs text-zinc-400 dark:text-zinc-600">{user.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-tight ${user.role === 'global_admin' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                                                user.role === 'admin' ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
                                                    'bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            {user.loginHistory && user.loginHistory.length > 0 ? (
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-1.5 text-zinc-900 dark:text-zinc-50 font-bold whitespace-nowrap">
                                                        <Clock className="size-3 text-zinc-400" />
                                                        {new Date(user.loginHistory[0].createdAt).toLocaleString([], {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </div>
                                                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                                                        {user.loginHistory[0].browser} • {user.loginHistory[0].os}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">
                                                    Never
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className={`text-xs font-black uppercase tracking-widest ${user.accessExpiresAt && new Date(user.accessExpiresAt) < now ? 'text-red-500' : 'text-zinc-900 group-hover:text-orange-600 transition-colors'}`}>
                                                    {formatTimeRemaining(user.accessExpiresAt)}
                                                </span>
                                                {user.accessExpiresAt && new Date(user.accessExpiresAt) >= now && (
                                                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">
                                                        Until {new Date(user.accessExpiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                             <div className="flex justify-end gap-2">
                                                 {/* ACCESS TIMER BUTTON */}
                                                 {((currentUser?.role === 'global_admin' && currentUser?.id !== user.id) || 
                                                    (currentUser?.role === 'admin' && user.role === 'employee')) && (
                                                      <button
                                                          onClick={() => { setAccessUser(user); setIsAccessModalOpen(true); }}
                                                          title="Manage Timed Access"
                                                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-50 text-zinc-500 hover:bg-orange-50 hover:text-orange-600 dark:bg-zinc-900 transition-colors"
                                                      >
                                                          <Clock className="size-4" />
                                                      </button>
                                                  )}
                                                 {/* EDIT BUTTON LOGIC:
                                                     1. Users cannot edit themselves here (use settings instead)
                                                     2. global_admin can edit any OTHER user
                                                     3. admin can edit any OTHER employee
                                                 */}
                                                 {(currentUser?.id !== user.id) && (
                                                   currentUser?.role === 'global_admin' || 
                                                   (currentUser?.role === 'admin' && user.role === 'employee')
                                                 ) && (
                                                     <button
                                                         onClick={() => openEditModal(user)}
                                                         className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-50 text-zinc-500 hover:bg-brand/5 hover:text-brand dark:bg-zinc-900 dark:hover:bg-brand/10 transition-colors"
                                                     >
                                                         <Pencil className="size-4" />
                                                     </button>
                                                 )}
                                                 
                                                 {/* DELETE BUTTON LOGIC:
                                                    1. Don't show delete button for the current user themselves
                                                    2. Only global_admin can delete anyone (except themselves)
                                                    3. regular admin can only delete employees
                                                */}
                                                {currentUser?.id !== user.id && (
                                                    (currentUser?.role === 'global_admin') || 
                                                    (currentUser?.role === 'admin' && user.role === 'employee')
                                                ) && (
                                                    <button
                                                        onClick={() => { setUserToDelete(user); setIsDeleteConfirmOpen(true); }}
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-50 text-zinc-500 hover:bg-red-50 hover:text-red-600 dark:bg-zinc-900 dark:hover:bg-red-900/20 transition-colors"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODALS */}
            <AnimatePresence>
                {(isAddModalOpen || isEditModalOpen) && (
                    <div key="user-form-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg rounded-[2.5rem] bg-white p-10 shadow-2xl dark:bg-zinc-950 dark:border dark:border-zinc-800"
                        >
                            <div className="mb-8 flex items-center justify-between">
                                <h2 className="text-2xl font-black">{isAddModalOpen ? "Create User" : "Edit User"}</h2>
                                <button onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="rounded-full p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900">
                                    <X className="size-6" />
                                </button>
                            </div>

                            <form onSubmit={isAddModalOpen ? handleCreateUser : handleUpdateUser} autoComplete="off" className="space-y-6">
                                {formError && (
                                    <div className="flex items-center gap-2 rounded-2xl bg-red-50 p-4 text-xs font-bold text-red-600 dark:bg-red-900/10 uppercase tracking-wider">
                                        <AlertCircle className="size-4" />
                                        {formError}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Full Name</label>
                                    <input
                                        autoComplete="off"
                                        autoCapitalize="off"
                                        autoCorrect="off"
                                        spellCheck="false"
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full h-12 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-900 rounded-2xl px-4 text-sm font-bold outline-none focus:border-orange-500/50"
                                        placeholder="Alexander Smith"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Email Address</label>
                                    <input
                                        type="email"
                                        autoComplete="off"
                                        autoCapitalize="off"
                                        autoCorrect="off"
                                        spellCheck="false"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full h-12 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-900 rounded-2xl px-4 text-sm font-bold outline-none focus:border-orange-500/50"
                                        placeholder="alex@exon.com"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">
                                        {isAddModalOpen ? "Password" : "New Password (Optional)"}
                                    </label>
                                    <input
                                        autoComplete="new-password"
                                        autoCapitalize="off"
                                        autoCorrect="off"
                                        spellCheck="false"
                                        type="password"
                                        required={isAddModalOpen}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full h-12 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-900 rounded-2xl px-4 text-sm font-bold outline-none focus:border-orange-500/50"
                                        placeholder="••••••••"
                                    />
                                </div>

                                {/* ROLE SELECTION UI:
                                    1. ONLY show for global_admin
                                    2. Regular admins can only create/manage employees (role is fixed)
                                    3. Hide when any user is editing themselves
                                */}
                                {currentUser?.role === 'global_admin' && (isAddModalOpen || (selectedUser?.id !== currentUser?.id)) && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">System Role</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {['employee', 'admin'].map(role => (
                                                <button
                                                    key={role}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, role })}
                                                    className={`h-11 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.role === role
                                                        ? 'bg-brand text-white shadow-lg'
                                                        : 'bg-zinc-50 text-zinc-400 dark:bg-zinc-900 hover:bg-zinc-100'
                                                        }`}
                                                >
                                                    {role.replace('_', ' ')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="w-full h-14 bg-brand text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-brand/20 hover:translate-y-[-2px] active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                                >
                                    {formLoading ? <Loader2 className="animate-spin" /> : (isAddModalOpen ? "Create User" : "Save Changes")}
                                    {!formLoading && <Check className="size-4" />}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}

                {isDeleteConfirmOpen && (
                    <div key="delete-confirm-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsDeleteConfirmOpen(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md rounded-[2.5rem] bg-white p-10 shadow-2xl dark:bg-zinc-950 dark:border dark:border-zinc-800"
                        >
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="h-16 w-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center dark:bg-red-900/10">
                                    <Trash2 className="size-8" />
                                </div>
                                <h2 className="text-2xl font-black">Delete User?</h2>
                                <p className="text-zinc-500 font-medium">
                                    Are you sure you want to delete <span className="text-zinc-900 dark:text-zinc-50 font-bold">{userToDelete?.name}</span>? This action cannot be undone.
                                </p>
                            </div>

                            <div className="mt-8 grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setIsDeleteConfirmOpen(false)}
                                    className="h-14 rounded-2xl bg-zinc-100 font-black text-xs uppercase tracking-widest hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteUser}
                                    disabled={formLoading}
                                    className="h-14 rounded-2xl bg-red-600 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-red-600/20 hover:bg-red-700 transition-colors flex items-center justify-center"
                                >
                                    {formLoading ? <Loader2 className="animate-spin" /> : "Confirm Delete"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
                {isAccessModalOpen && (
                    <div key="access-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAccessModalOpen(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-sm rounded-[2.5rem] bg-white p-10 shadow-2xl dark:bg-zinc-950"
                        >
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="h-16 w-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center dark:bg-orange-900/10">
                                    <Clock className="size-8" />
                                </div>
                                <h2 className="text-2xl font-black">Timed Access</h2>
                                <p className="text-zinc-500 font-medium">
                                    Set access duration for <span className="text-zinc-900 dark:text-zinc-50 font-bold">{accessUser?.name}</span>
                                </p>
                            </div>

                            <div className="mt-8 grid grid-cols-1 gap-3">
                                {[
                                    { label: "1 Hour Access", mins: 60 },
                                    { label: "8 Hours (Shift)", mins: 480 },
                                    { label: "24 Hours Access", mins: 1440 },
                                    { label: "Unlimited Access", mins: null },
                                ].map((opt, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleUpdateAccess(accessUser, opt.mins)}
                                        disabled={formLoading}
                                        className="h-12 w-full rounded-2xl bg-zinc-50 text-zinc-900 font-bold text-xs uppercase tracking-widest hover:bg-zinc-100 transition-all flex items-center justify-center gap-2"
                                    >
                                        {opt.label}
                                    </button>
                                ))}

                                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-900 mt-2 space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1 text-left block">Custom Duration (Minutes)</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            min="1"
                                            value={customMinutes}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === "" || parseInt(val) >= 0) {
                                                    setCustomMinutes(val);
                                                }
                                            }}
                                            placeholder="Enter minutes..."
                                            className="h-12 flex-1 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-transparent focus:border-orange-500/50 outline-none px-4 text-sm font-bold placeholder:text-zinc-400 placeholder:font-normal"
                                        />
                                        <button
                                            onClick={() => {
                                                if (customMinutes > 0) handleUpdateAccess(accessUser, parseInt(customMinutes));
                                            }}
                                            disabled={!customMinutes || customMinutes <= 0 || formLoading}
                                            className="h-12 px-6 rounded-2xl bg-orange-600 text-white font-black text-xs uppercase tracking-widest hover:bg-orange-700 transition-all disabled:opacity-50"
                                        >
                                            Set
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={() => { setIsAccessModalOpen(false); setCustomMinutes(""); }}
                                    className="mt-2 h-12 w-full rounded-2xl border border-zinc-100 text-zinc-400 font-bold text-xs uppercase tracking-widest hover:bg-zinc-50 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* TOAST SYSTEM */}
                <AnimatePresence>
                    {toast.show && (
                        <motion.div
                            key="toast-notification"
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed bottom-10 right-10 z-[100]"
                        >
                            <div className={cn(
                                "flex items-center gap-3 rounded-2xl px-6 py-4 shadow-2xl backdrop-blur-xl border border-white/20",
                                toast.type === "success" 
                                    ? "bg-emerald-500/90 text-white" 
                                    : "bg-red-500/90 text-white"
                            )}>
                                {toast.type === "success" ? (
                                    <Check className="size-5" />
                                ) : (
                                    <AlertCircle className="size-5" />
                                )}
                                <span className="text-sm font-black uppercase tracking-widest">{toast.message}</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </AnimatePresence>
        </div>
    );
}
