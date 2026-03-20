"use client";

import {
    AnimatePresence,
    motion
} from "framer-motion";
import {
    Plus,
    Search,
    BookOpen,
    FileText,
    Image as ImageIcon,
    Package,
    Truck,
    ArrowRight,
    Loader2,
    X,
    Check,
    ChevronDown,
    ChevronUp,
    Layout,
    Trash2,
    AlertTriangle
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import TiptapEditor from "@/components/TiptapEditor";

export default function KnowledgeBase() {
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === "global_admin" || session?.user?.role === "admin";

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    
    // Modal states
    const [isCatModalOpen, setIsCatModalOpen] = useState(false);
    const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    
    // Selection states
    const [selectedCatId, setSelectedCatId] = useState(null);
    const [selectedModuleId, setSelectedModuleId] = useState(null);
    const [expandedCat, setExpandedCat] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null); // { type, id, name }

    // Form inputs
    const [catName, setCatName] = useState("");
    const [moduleTitle, setModuleTitle] = useState("");
    const [moduleDesc, setModuleDesc] = useState("");
    const [itemName, setItemName] = useState("");
    const [itemContent, setItemContent] = useState("");
    const [formLoading, setFormLoading] = useState(false);

    const fetchKnowledge = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/knowledge/categories");
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setCategories(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKnowledge();
    }, []);

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            const res = await fetch("/api/knowledge/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: catName })
            });
            if (res.ok) {
                setCatName("");
                setIsCatModalOpen(false);
                fetchKnowledge();
            }
        } finally {
            setFormLoading(false);
        }
    };

    const handleCreateModule = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            const res = await fetch("/api/knowledge/modules", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    title: moduleTitle, 
                    description: moduleDesc, 
                    categoryId: selectedCatId 
                })
            });
            if (res.ok) {
                setModuleTitle("");
                setModuleDesc("");
                setIsModuleModalOpen(false);
                fetchKnowledge();
            }
        } finally {
            setFormLoading(false);
        }
    };

    const handleCreateItem = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            const res = await fetch("/api/knowledge/items", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    title: itemName, 
                    content: itemContent, 
                    moduleId: selectedModuleId 
                })
            });
            if (res.ok) {
                setItemName("");
                setItemContent("");
                setIsItemModalOpen(false);
                fetchKnowledge();
            }
        } finally {
            setFormLoading(false);
        }
    };
    const handleDeleteCategory = (id, name) => setDeleteConfirm({ type: 'category', id, name });
    const handleDeleteModule = (id, title) => setDeleteConfirm({ type: 'module', id, name: title });
    const handleDeleteItem = (id, title) => setDeleteConfirm({ type: 'item', id, name: title });

    const executeDelete = async () => {
        if (!deleteConfirm) return;
        setFormLoading(true);
        try {
            const endpoint = `/api/knowledge/${deleteConfirm.type === 'category' ? 'categories' : (deleteConfirm.type === 'module' ? 'modules' : 'items')}/${deleteConfirm.id}`;
            const res = await fetch(endpoint, { method: "DELETE" });
            if (res.ok) {
                fetchKnowledge();
                setDeleteConfirm(null);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setFormLoading(false);
        }
    };
    const filteredCategories = categories.filter(cat => 
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.modules.some(mod => mod.title.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            
            {/* Header section */}
            <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white">
                        <BookOpen className="size-3.5" />
                        Learning Center
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-zinc-900 md:text-5xl">
                        Knowledge Base
                    </h1>
                    <p className="max-w-xl text-zinc-500 font-medium">
                        Corporate library for training modules, process descriptions, and instructions.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Quick search..."
                            className="h-12 w-full rounded-2xl border border-zinc-100 bg-white pl-12 pr-4 text-sm font-bold shadow-sm transition-all focus:border-zinc-300 outline-none"
                        />
                    </div>
                    {isAdmin && (
                        <button 
                            onClick={() => setIsCatModalOpen(true)}
                            className="flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-6 font-black text-xs text-white uppercase tracking-widest shadow-xl transition-transform hover:scale-105 active:scale-95"
                        >
                            <Plus className="size-4" />
                            New Category
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <Loader2 className="size-10 animate-spin text-zinc-300" />
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Loading Library...</span>
                </div>
            ) : categories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 rounded-[3rem] border border-dashed border-zinc-200 bg-zinc-50/50">
                    <Package className="size-12 text-zinc-200 mb-4" />
                    <h3 className="text-xl font-black text-zinc-400">Library is Empty</h3>
                    <p className="text-zinc-400 mt-1">Start by creating your first category.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8">
                    {filteredCategories.map((cat) => (
                        <div key={cat.id} className="group overflow-hidden rounded-[3rem] border border-zinc-100 bg-white shadow-xl transition-all hover:border-zinc-200">
                            <div 
                                onClick={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)}
                                className="flex cursor-pointer items-center justify-between p-8 sm:p-10"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-zinc-50 text-zinc-900 shadow-inner group-hover:bg-zinc-900 group-hover:text-white transition-all duration-500">
                                        <Layout className="size-8" />
                                    </div>
                                    <div className="space-y-1">
                                        <h2 className="text-3xl font-black tracking-tight">{cat.name}</h2>
                                        <div className="flex items-center gap-3">
                                            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                                                {cat.modules.length} Modules Available
                                            </p>
                                            {isAdmin && cat.modules.length === 0 && (
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id, cat.name); }}
                                                    className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors"
                                                    title="Delete empty category"
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {isAdmin && (
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setSelectedCatId(cat.id); setIsModuleModalOpen(true); }}
                                                className="hidden sm:flex h-10 items-center gap-2 rounded-xl bg-orange-50 px-4 text-[10px] font-black uppercase tracking-widest text-orange-600 transition-all hover:bg-orange-100"
                                            >
                                                <Plus className="size-3.5" />
                                                Add Book
                                            </button>
                                        </div>
                                    )}
                                    {expandedCat === cat.id ? <ChevronUp className="size-6 text-zinc-300" /> : <ChevronDown className="size-6 text-zinc-300" />}
                                </div>
                            </div>

                            <AnimatePresence>
                                {expandedCat === cat.id && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="border-t border-zinc-50 bg-zinc-50/20"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 p-8 gap-6 sm:p-10">
                                            {cat.modules.length === 0 ? (
                                                <div className="col-span-2 py-10 text-center opacity-30 italic font-medium">No books in this category yet.</div>
                                            ) : (
                                                cat.modules.map((mod) => (
                                                    <div key={mod.id} className="relative overflow-hidden rounded-[2rem] border border-zinc-100 bg-white p-8 shadow-md group/mod hover:border-orange-200 transition-all">
                                                        <div className="flex flex-col h-full justify-between">
                                                            <div className="space-y-4">
                                                                <div className="flex items-start justify-between">
                                                                    <div className="h-12 w-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                                                                        <BookOpen className="size-6" />
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        {isAdmin && mod.items.length === 0 && (
                                                                            <button 
                                                                                onClick={(e) => { e.stopPropagation(); handleDeleteModule(mod.id, mod.title); }}
                                                                                className="opacity-0 group-hover/mod:opacity-100 flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:text-red-500 transition-all hover:bg-red-50"
                                                                                title="Delete empty book"
                                                                            >
                                                                                <Trash2 className="size-4" />
                                                                            </button>
                                                                        )}
                                                                        {isAdmin && (
                                                                            <button 
                                                                                onClick={() => { setSelectedModuleId(mod.id); setIsItemModalOpen(true); }}
                                                                                className="opacity-0 group-hover/mod:opacity-100 flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-950 text-white transition-all hover:scale-110"
                                                                            >
                                                                                <Plus className="size-4" />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <h3 className="text-xl font-black">{mod.title}</h3>
                                                                <p className="text-sm text-zinc-500 font-medium line-clamp-2">
                                                                    {mod.description || "No description provided."}
                                                                </p>
                                                            </div>
                                                            
                                                            <div className="mt-8 flex flex-col gap-3">
                                                                {mod.items.map(item => (
                                                                    <div key={item.id} className="group/item flex items-center justify-between gap-3 bg-zinc-50/50 p-2.5 rounded-xl border border-transparent hover:border-zinc-200 transition-all">
                                                                        <button 
                                                                            onClick={() => setSelectedItem(item)}
                                                                            className="flex items-center gap-3 text-xs font-bold text-zinc-400 hover:text-zinc-900 transition-colors flex-1 text-left"
                                                                        >
                                                                            <FileText className="size-3.5 opacity-50" />
                                                                            {item.title}
                                                                        </button>
                                                                        {isAdmin && (
                                                                            <button 
                                                                                onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id, item.title); }}
                                                                                className="opacity-0 group-hover/item:opacity-100 p-1 text-zinc-400 hover:text-red-500 transition-all"
                                                                            >
                                                                                <Trash2 className="size-3" />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                                {mod.items.length === 0 && (
                                                                    <span className="text-[10px] uppercase font-black tracking-widest text-zinc-300">No content yet</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            )}

            {/* MODALS */}
            <AnimatePresence>
                {/* Category Modal */}
                {isCatModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCatModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-md rounded-[2.5rem] bg-white p-10 shadow-2xl">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black">New Category</h2>
                                <button onClick={() => setIsCatModalOpen(false)} className="rounded-full p-2 hover:bg-zinc-100"><X className="size-6" /></button>
                            </div>
                            <form onSubmit={handleCreateCategory} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Category Name</label>
                                    <input required value={catName} onChange={(e) => setCatName(e.target.value)} type="text" className="h-12 w-full rounded-2xl bg-zinc-50 border border-transparent focus:border-zinc-200 px-4 outline-none font-bold" placeholder="e.g. Graphic Design" />
                                </div>
                                <button disabled={formLoading} type="submit" className="h-14 w-full rounded-2xl bg-zinc-950 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                                    {formLoading ? <Loader2 className="animate-spin" /> : <><Check className="size-4" /> Create Category</>}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* Module Modal */}
                {isModuleModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModuleModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-lg rounded-[2.5rem] bg-white p-10 shadow-2xl">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black">New Training Book</h2>
                                <button onClick={() => setIsModuleModalOpen(false)} className="rounded-full p-2 hover:bg-zinc-100"><X className="size-6" /></button>
                            </div>
                            <form onSubmit={handleCreateModule} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Book Title</label>
                                    <input required value={moduleTitle} onChange={(e) => setModuleTitle(e.target.value)} type="text" className="h-12 w-full rounded-2xl bg-zinc-50 border border-transparent focus:border-zinc-200 px-4 outline-none font-bold" placeholder="e.g. Master the Shipping Flow" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Description</label>
                                    <textarea value={moduleDesc} onChange={(e) => setModuleDesc(e.target.value)} rows={3} className="w-full rounded-2xl bg-zinc-50 border border-transparent focus:border-zinc-200 p-4 outline-none font-bold text-sm" placeholder="Summarize what users will learn..." />
                                </div>
                                <button disabled={formLoading} type="submit" className="h-14 w-full rounded-2xl bg-zinc-950 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                                    {formLoading ? <Loader2 className="animate-spin" /> : <><Check className="size-4" /> Save Book</>}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* Item (Block) Modal */}
                {isItemModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsItemModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-2xl rounded-[2.5rem] bg-white p-10 shadow-2xl">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black">Add Content Block</h2>
                                <button onClick={() => setIsItemModalOpen(false)} className="rounded-full p-2 hover:bg-zinc-100"><X className="size-6" /></button>
                            </div>
                            <form onSubmit={handleCreateItem} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Block Headline</label>
                                    <input required value={itemName} onChange={(e) => setItemName(e.target.value)} type="text" className="h-12 w-full rounded-2xl bg-zinc-50 border border-transparent focus:border-zinc-200 px-4 outline-none font-bold" placeholder="e.g. Preparing the parcel for courier" />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Main Content (Rich Text)</label>
                                    <TiptapEditor 
                                        content={itemContent} 
                                        onChange={(html) => setItemContent(html)} 
                                    />
                                </div>
                                <button disabled={formLoading} type="submit" className="h-14 w-full rounded-2xl bg-zinc-950 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                                    {formLoading ? <Loader2 className="animate-spin" /> : <><Check className="size-4" /> Add Block</>}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* Reader Modal */}
                {selectedItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedItem(null)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
                        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-[3.5rem] bg-white p-12 shadow-2xl custom-scrollbar">
                            <div className="flex items-center justify-between mb-10 sticky top-0 bg-white/80 backdrop-blur-md py-2 -mt-4 z-10">
                                <div className="space-y-1">
                                    <h2 className="text-3xl font-black tracking-tight">{selectedItem.title}</h2>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Content Block</p>
                                </div>
                                <button onClick={() => setSelectedItem(null)} className="rounded-2xl p-3 bg-zinc-50 hover:bg-zinc-100 transition-colors"><X className="size-6" /></button>
                            </div>
                            <div className="prose prose-zinc max-w-none dark:prose-invert">
                                <div 
                                    className="text-lg leading-relaxed text-zinc-600 font-medium"
                                    dangerouslySetInnerHTML={{ __html: selectedItem.content }}
                                />
                            </div>
                        </motion.div>
                    </div>
                )}
                {/* Delete Confirmation Modal */}
                {deleteConfirm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteConfirm(null)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-sm overflow-hidden rounded-[2.5rem] bg-white p-10 shadow-2xl">
                            <div className="flex flex-col items-center text-center">
                                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                                    <AlertTriangle className="size-8" />
                                </div>
                                <h3 className="mb-2 text-2xl font-black tracking-tight text-zinc-900">Are you sure?</h3>
                                <p className="mb-8 text-sm font-medium text-zinc-500">
                                    You are about to delete <span className="font-bold text-zinc-900">{deleteConfirm.name}</span>.<br />
                                    This action cannot be undone.
                                </p>
                                <div className="flex w-full gap-3">
                                    <button 
                                        onClick={() => setDeleteConfirm(null)}
                                        className="h-12 flex-1 rounded-2xl bg-zinc-100 font-black text-[10px] uppercase tracking-widest text-zinc-600 hover:bg-zinc-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={executeDelete}
                                        disabled={formLoading}
                                        className="h-12 flex-1 rounded-2xl bg-red-600 font-black text-[10px] uppercase tracking-widest text-white hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 disabled:opacity-50"
                                    >
                                        {formLoading ? <Loader2 className="mx-auto size-4 animate-spin" /> : 'Delete Now'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
