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

export default function UserManagement() {
    const { data: session } = useSession();
    const currentUser = session?.user;

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    // Modal state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

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
        } catch (err) {
            alert(err.message);
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
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                            {loading ? (
                                <tr>
                                    <td colSpan="3" className="px-8 py-10 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="size-6 animate-spin text-brand" />
                                            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Loading Users...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="px-8 py-10 text-center text-zinc-400 font-bold uppercase tracking-widest text-xs">
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
                                        <td className="px-8 py-5 text-right">
                                             <div className="flex justify-end gap-2">
                                                 {/* EDIT BUTTON LOGIC:
                                                     1. global_admin can edit anyone
                                                     2. admin can edit themselves
                                                     3. admin can edit employee
                                                     4. admin CANNOT edit other admins or global_admins
                                                 */}
                                                 {(currentUser?.role === 'global_admin' || 
                                                  currentUser?.id === user.id || 
                                                  (currentUser?.role === 'admin' && user.role === 'employee')) && (
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
                                    1. Hide entire section for any user (admin/global_admin) editing themselves
                                    2. Show for new users or editing others
                                */}
                                {(isAddModalOpen || (selectedUser?.id !== currentUser?.id)) && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">System Role</label>
                                        <div className={`grid ${currentUser?.role === 'global_admin' ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
                                            {['employee', 'admin']
                                                .filter(role => currentUser?.role === 'global_admin' || role === 'employee')
                                                .map(role => (
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
            </AnimatePresence>
        </div>
    );
}
