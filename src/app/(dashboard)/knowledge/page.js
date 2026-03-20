"use client";

import TiptapEditor from "@/components/TiptapEditor";
import {
    AnimatePresence,
    motion
} from "framer-motion";
import {
    AlertTriangle,
    BookOpen,
    BookOpenCheck,
    Check,
    ChevronDown,
    ChevronUp,
    Clock,
    FileText,
    Folder,
    FolderOpen,
    Grape,
    Layout,
    LayoutGrid,
    Loader2,
    MoreVertical,
    MoveRight,
    Package,
    Pause,
    Pencil,
    Play,
    Plus,
    Search,
    Sparkles,
    Square,
    Trash2,
    Volume2,
    X
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useRef, useState } from "react";

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
    const [editingId, setEditingId] = useState(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [currentWordIndex, setCurrentWordIndex] = useState(-1);
    const [formLoading, setFormLoading] = useState(false);
    const scrollContainerRef = useRef(null);

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

    const [bestVoice, setBestVoice] = useState(null);

    useEffect(() => {
        fetchKnowledge();

        const updateVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            // Look for "Neural" or "Natural" or "Google" Russian voices first as they sound better
            const ruVoice = voices.find(v => v.lang.startsWith('ru') && (v.name.includes('Neural') || v.name.includes('Google') || v.name.includes('Natural')))
                || voices.find(v => v.lang.startsWith('ru'));
            setBestVoice(ruVoice);
        };

        window.speechSynthesis.onvoiceschanged = updateVoices;
        updateVoices();

        return () => window.speechSynthesis.cancel();
    }, []);

    useEffect(() => {
        if (!selectedItem) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            setIsPaused(false);
            setCurrentWordIndex(-1);
        }
    }, [selectedItem]);

    useEffect(() => {
        if (currentWordIndex >= 0 && scrollContainerRef.current) {
            const wordElement = document.getElementById(`speech-word-${currentWordIndex}`);
            if (wordElement) {
                wordElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [currentWordIndex]);

    const memoizedContent = useMemo(() => {
        if (!selectedItem?.content) return "";
        let wordCount = 0;
        // Wrap words in spans, preserving the tags
        return selectedItem.content.replace(/(<[^>]+>)|([^\s<>]+)/g, (match, tag, word) => {
            if (tag) return tag;
            return `<span id="speech-word-${wordCount++}" class="speech-word transition-all duration-200 rounded">${word}</span>`;
        });
    }, [selectedItem]);

    const stripHtml = (html) => {
        if (typeof window === 'undefined') return "";
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    };

    const calculateReadingTime = (html) => {
        const text = stripHtml(html);
        const wpm = 200;
        const words = text.split(/\s+/).filter(Boolean).length;
        const time = Math.ceil(words / wpm);
        return time === 0 ? 1 : time;
    };

    const handleStop = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setIsPaused(false);
        setCurrentWordIndex(-1);
    };

    const startSpeech = (text) => {
        window.speechSynthesis.cancel();
        const fullText = stripHtml(text);
        const utterance = new SpeechSynthesisUtterance(fullText);

        if (bestVoice) {
            utterance.voice = bestVoice;
        } else {
            utterance.lang = 'ru-RU';
        }

        utterance.rate = 1; // Natural speed
        utterance.pitch = 1.0;

        utterance.onboundary = (event) => {
            if (event.name === 'word') {
                const textUpToChar = fullText.substring(0, event.charIndex);
                const wordIndex = textUpToChar.split(/\s+/).filter(Boolean).length;
                setCurrentWordIndex(wordIndex);
            }
        };

        utterance.onend = () => {
            setIsSpeaking(false);
            setIsPaused(false);
            setCurrentWordIndex(-1);
        };

        utterance.onerror = () => {
            setIsSpeaking(false);
            setIsPaused(false);
            setCurrentWordIndex(-1);
        };

        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
        setIsPaused(false);
    };

    const handlePlayPause = (text) => {
        if (isPaused) {
            window.speechSynthesis.resume();
            setIsPaused(false);
            setIsSpeaking(true);
        } else if (isSpeaking) {
            window.speechSynthesis.pause();
            setIsPaused(true);
            setIsSpeaking(false);
        } else {
            startSpeech(text);
        }
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            const method = editingId ? "PATCH" : "POST";
            const url = editingId ? `/api/knowledge/categories/${editingId}` : "/api/knowledge/categories";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: catName })
            });
            if (res.ok) {
                setCatName("");
                setEditingId(null);
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
            const method = editingId ? "PATCH" : "POST";
            const url = editingId ? `/api/knowledge/modules/${editingId}` : "/api/knowledge/modules";

            const res = await fetch(url, {
                method,
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
                setEditingId(null);
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
            const method = editingId ? "PATCH" : "POST";
            const url = editingId ? `/api/knowledge/items/${editingId}` : "/api/knowledge/items";

            const res = await fetch(url, {
                method,
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
                setEditingId(null);
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
        <div className="min-h-screen bg-[#F9FAFB] p-6 lg:p-12 font-sans selection:bg-orange-100 selection:text-orange-900">
            {/* Header Section */}
            <div className="max-w-7xl mx-auto mb-16 px-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100">
                            <Sparkles className="size-3.5 text-orange-600" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-orange-700">Educational Hub</span>
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-black tracking-tight text-zinc-900">
                            Knowledge <span className="text-orange-500">Base</span>
                        </h1>
                        <p className="text-lg text-zinc-500 font-medium max-w-2xl leading-relaxed">
                            Everything you need to know about our processes, guidelines, and instructions in one friendly place.
                        </p>
                    </div>
                    {isAdmin && (
                        <button
                            onClick={() => {
                                setEditingId(null);
                                setCatName("");
                                setIsCatModalOpen(true);
                            }}
                            className="group flex items-center gap-3 rounded-2xl bg-zinc-950 px-8 py-4 text-white transition-all hover:bg-zinc-800 hover:shadow-xl hover:-translate-y-1 active:scale-95"
                        >
                            <Plus className="size-5 transition-transform group-hover:rotate-90" />
                            <span className="font-bold tracking-tight">Create Category</span>
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="flex h-[400px] items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="size-12 animate-spin text-orange-500" />
                        <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Opening Library...</span>
                    </div>
                </div>
            ) : categories.length === 0 ? (
                <div className="max-w-7xl mx-auto flex flex-col items-center justify-center py-24 rounded-[3rem] border-2 border-dashed border-zinc-200 bg-white">
                    <div className="size-20 rounded-3xl bg-zinc-50 flex items-center justify-center mb-6">
                        <Package className="size-10 text-zinc-300" />
                    </div>
                    <h3 className="text-2xl font-black text-zinc-900">Library is Empty</h3>
                    <p className="text-zinc-500 font-medium mt-1">Start by creating your first category to organize documents.</p>
                </div>
            ) : (
                <div className="max-w-7xl mx-auto space-y-8">
                    {filteredCategories.map((cat) => (
                        <div 
                            key={cat.id} 
                            className={`group rounded-[2.5rem] transition-all duration-500 ${expandedCat === cat.id ? 'bg-white shadow-2xl ring-1 ring-zinc-100 p-8 pt-6' : 'bg-transparent text-zinc-900'}`}
                        >
                            {/* Category Banner Card */}
                            <div 
                                onClick={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)}
                                className={`flex items-center justify-between cursor-pointer group/card transition-all rounded-[2rem] p-6 ${expandedCat === cat.id ? 'bg-zinc-50/50 mb-8 px-8' : 'bg-white shadow-sm border border-zinc-100 hover:shadow-md hover:border-orange-200'}`}
                            >
                                <div className="flex items-center gap-6">
                                    <div className={`size-16 rounded-[1.25rem] flex items-center justify-center transition-all duration-500 ${expandedCat === cat.id ? 'bg-orange-500 text-white rotate-6 scale-110 shadow-lg shadow-orange-500/20' : 'bg-orange-50 text-orange-500 group-hover/card:scale-110'}`}>
                                        {expandedCat === cat.id ? <FolderOpen className="size-8" /> : <Folder className="size-8" />}
                                    </div>
                                    <div className="space-y-1">
                                        <h2 className={`text-2xl font-black tracking-tight transition-colors ${expandedCat === cat.id ? 'text-zinc-900' : 'text-zinc-700 group-hover/card:text-zinc-900'}`}>{cat.name}</h2>
                                        <div className="flex items-center gap-4 text-xs font-bold text-zinc-400">
                                            <span className="flex items-center gap-1.5"><LayoutGrid className="size-3.5" />{cat.modules.length} modules</span>
                                            <span className="flex items-center gap-1.5"><BookOpenCheck className="size-3.5" />{cat.modules.reduce((acc, m) => acc + m.items.length, 0)} lessons</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-4">
                                    {isAdmin && (
                                        <div className="hidden sm:flex items-center gap-2 pr-4 border-r border-zinc-200" onClick={e => e.stopPropagation()}>
                                            <button 
                                                onClick={() => { setEditingId(cat.id); setCatName(cat.name); setIsCatModalOpen(true); }}
                                                className="p-2.5 rounded-xl hover:bg-white hover:shadow-sm text-zinc-400 hover:text-zinc-900 transition-all"
                                            >
                                                <Pencil className="size-4.5" />
                                            </button>
                                            {cat.modules.length === 0 && (
                                                <button 
                                                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                                    className="p-2.5 rounded-xl hover:bg-white hover:shadow-sm text-zinc-400 hover:text-red-500 transition-all"
                                                >
                                                    <Trash2 className="size-4.5" />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                    <div className={`size-10 rounded-full flex items-center justify-center transition-all duration-300 ${expandedCat === cat.id ? 'bg-zinc-950 text-white rotate-180' : 'bg-zinc-100 text-zinc-400 group-hover/card:bg-zinc-200'}`}>
                                        <ChevronDown className="size-5" />
                                    </div>
                                </div>
                            </div>

                            <AnimatePresence>
                                {expandedCat === cat.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-4 px-2">
                                            {cat.modules.length === 0 ? (
                                                <div className="col-span-2 py-16 text-center">
                                                    <div className="inline-flex size-20 rounded-full bg-zinc-50 items-center justify-center text-zinc-200 mb-4 border border-dashed border-zinc-200">
                                                        <BookOpen className="size-10" />
                                                    </div>
                                                    <p className="text-zinc-400 font-bold italic tracking-tight">No learning modules yet...</p>
                                                </div>
                                            ) : (
                                                cat.modules.map((mod) => (
                                                    <div key={mod.id} className="group/mod relative bg-zinc-50/50 rounded-[2rem] border border-zinc-100 p-8 transition-all hover:bg-white hover:shadow-2xl hover:border-orange-100/50 overflow-hidden flex flex-col h-full">
                                                        {/* Module Decoration */}
                                                        <div className="absolute -right-4 -top-4 size-32 bg-orange-500/5 rounded-full blur-3xl group-hover/mod:bg-orange-500/10 transition-all" />
                                                        
                                                        <div className="relative flex flex-col h-full space-y-6">
                                                            <div className="flex items-start justify-between">
                                                                <div className="size-14 rounded-2xl bg-white shadow-sm border border-zinc-100 flex items-center justify-center text-orange-500 group-hover/mod:scale-110 group-hover/mod:rotate-3 transition-transform">
                                                                    <BookOpen className="size-7" />
                                                                </div>
                                                                
                                                                {isAdmin && (
                                                                    <div className="flex items-center gap-1.5 opacity-0 group-hover/mod:opacity-100 transition-all translate-x-2 group-hover/mod:translate-x-0">
                                                                        <button
                                                                            onClick={() => {
                                                                                setEditingId(mod.id);
                                                                                setModuleTitle(mod.title);
                                                                                setModuleDesc(mod.description || "");
                                                                                setSelectedCatId(cat.id);
                                                                                setIsModuleModalOpen(true);
                                                                            }}
                                                                            className="p-2.5 rounded-xl hover:bg-white text-zinc-400 hover:text-zinc-900 shadow-sm transition-all border border-transparent hover:border-zinc-100"
                                                                        >
                                                                            <Pencil className="size-4" />
                                                                        </button>
                                                                        {mod.items.length === 0 && (
                                                                            <button
                                                                                onClick={() => handleDeleteModule(mod.id, mod.title)}
                                                                                className="p-2.5 rounded-xl hover:bg-white text-zinc-400 hover:text-red-500 shadow-sm transition-all border border-transparent hover:border-zinc-100"
                                                                            >
                                                                                <Trash2 className="size-4" />
                                                                            </button>
                                                                        )}
                                                                        <button
                                                                            onClick={() => {
                                                                                setSelectedModuleId(mod.id);
                                                                                setEditingId(null);
                                                                                setItemName("");
                                                                                setItemContent("");
                                                                                setIsItemModalOpen(true);
                                                                            }}
                                                                            className="size-10 rounded-xl bg-zinc-950 text-white flex items-center justify-center shadow-lg hover:bg-orange-600 transition-all ml-1"
                                                                        >
                                                                            <Plus className="size-6" />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="space-y-2">
                                                                <h3 className="text-2xl font-black text-zinc-900 leading-tight group-hover/mod:text-orange-950 transition-colors">{mod.title}</h3>
                                                                <p className="text-sm text-zinc-500 font-medium line-clamp-2 leading-relaxed h-10">
                                                                    {mod.description || "Learn the ins and outs of this section."}
                                                                </p>
                                                            </div>

                                                            <div className="space-y-2.5 mt-auto pt-4 border-t border-zinc-200/50">
                                                                {mod.items.map((item, idx) => (
                                                                    <div key={item.id} className="group/item flex items-center gap-4 p-2 rounded-2xl hover:bg-zinc-50 border border-transparent hover:border-zinc-100 transition-all relative">
                                                                        <button
                                                                            onClick={() => setSelectedItem(item)}
                                                                            className="flex-1 flex items-center gap-4 text-left"
                                                                        >
                                                                            <div className="relative z-10 size-11 rounded-xl bg-white border border-zinc-100 flex items-center justify-center text-zinc-400 group-hover/item:text-orange-500 group-hover/item:border-orange-200 group-hover/item:shadow-sm transition-all">
                                                                                <FileText className="size-5" />
                                                                                <div className="absolute -bottom-1 -right-1 size-5 bg-zinc-100 rounded-lg flex items-center justify-center text-[9px] font-black text-zinc-500 border-2 border-white group-hover/item:bg-orange-500 group-hover/item:text-white transition-all">
                                                                                    {idx + 1}
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="text-[11px] font-black text-zinc-400 truncate group-hover/item:text-zinc-900 transition-colors uppercase tracking-tight">{item.title}</p>
                                                                                <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-300">
                                                                                    <Clock className="size-3" />
                                                                                    <span>{calculateReadingTime(item.content)} MIN READ</span>
                                                                                </div>
                                                                            </div>
                                                                            <div className="opacity-0 group-hover/item:opacity-100 transition-all -translate-x-2 group-hover/item:translate-x-0 pr-1">
                                                                                <MoveRight className="size-4 text-orange-500" />
                                                                            </div>
                                                                        </button>
                                                                        
                                                                        {isAdmin && (
                                                                            <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-all">
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        setEditingId(item.id);
                                                                                        setItemName(item.title);
                                                                                        setItemContent(item.content);
                                                                                        setSelectedModuleId(mod.id);
                                                                                        setIsItemModalOpen(true);
                                                                                    }}
                                                                                    className="p-2 text-zinc-300 hover:text-zinc-600 transition-all hover:bg-white rounded-lg shadow-sm"
                                                                                >
                                                                                    <Pencil className="size-3.5" />
                                                                                </button>
                                                                                <button
                                                                                    onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id, item.title); }}
                                                                                    className="p-2 text-zinc-300 hover:text-red-500 transition-all hover:bg-white rounded-lg shadow-sm"
                                                                                >
                                                                                    <Trash2 className="size-3.5" />
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                                {mod.items.length === 0 && (
                                                                    <div className="flex items-center gap-3 py-6 px-4 bg-white/40 rounded-[1.5rem] border border-dashed border-zinc-200">
                                                                        <div className="size-2 rounded-full bg-zinc-300 animate-pulse" />
                                                                        <span className="text-xs font-bold text-zinc-300 tracking-tight italic">Waiting for lessons...</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        
                                        {isAdmin && (
                                            <div className="flex justify-center pb-8 pt-6">
                                                <button
                                                    onClick={() => {
                                                        setSelectedCatId(cat.id);
                                                        setEditingId(null);
                                                        setModuleTitle("");
                                                        setModuleDesc("");
                                                        setIsModuleModalOpen(true);
                                                    }}
                                                    className="group flex items-center gap-4 px-10 py-5 rounded-[2rem] bg-white border-2 border-dashed border-zinc-200 text-zinc-400 font-bold hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50/50 transition-all duration-300"
                                                >
                                                    <div className="size-8 rounded-full bg-zinc-50 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all">
                                                        <Plus className="size-5" />
                                                    </div>
                                                    <span className="uppercase text-[11px] tracking-[0.2em] font-black">Add New Learning Book</span>
                                                </button>
                                            </div>
                                        )}
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
                                <h2 className="text-2xl font-black">{editingId ? "Edit Category" : "New Category"}</h2>
                                <button onClick={() => setIsCatModalOpen(false)} className="rounded-full p-2 hover:bg-zinc-100"><X className="size-6" /></button>
                            </div>
                            <form onSubmit={handleCreateCategory} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Category Name</label>
                                    <input required value={catName} onChange={(e) => setCatName(e.target.value)} type="text" className="h-12 w-full rounded-2xl bg-zinc-50 border border-transparent focus:border-zinc-200 px-4 outline-none font-bold" placeholder="e.g. Graphic Design" />
                                </div>
                                <button disabled={formLoading} type="submit" className="h-14 w-full rounded-2xl bg-zinc-950 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                                    {formLoading ? <Loader2 className="animate-spin" /> : <><Check className="size-4" /> {editingId ? "Update Category" : "Create Category"}</>}
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
                                <h2 className="text-2xl font-black">{editingId ? "Edit Training Book" : "New Training Book"}</h2>
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
                                    {formLoading ? <Loader2 className="animate-spin" /> : <><Check className="size-4" /> {editingId ? "Update Book" : "Save Book"}</>}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* Item (Block) Modal */}
                {isItemModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsItemModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-[2.5rem] bg-white p-10 shadow-2xl">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black">{editingId ? "Edit Content Block" : "Add Content Block"}</h2>
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
                                    {formLoading ? <Loader2 className="animate-spin" /> : <><Check className="size-4" /> {editingId ? "Update Block" : "Add Block"}</>}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* Reader Modal */}
                {selectedItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedItem(null)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
                        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-[3.5rem] bg-white p-12 shadow-2xl custom-scrollbar" ref={scrollContainerRef}>
                            <style>{`
                                .speech-word {
                                    padding: 1px 2px;
                                }
                                #speech-word-${currentWordIndex} {
                                    background-color: #ffedd5 !important;
                                    color: #ea580c !important;
                                    box-shadow: 0 0 0 2px #ffedd5;
                                    font-weight: 700;
                                }
                            `}</style>
                            <div className="flex items-center justify-between mb-10 sticky top-0 bg-white/80 backdrop-blur-md py-2 -mt-4 z-10">
                                <div className="space-y-1">
                                    <h2 className="text-3xl font-black tracking-tight">{selectedItem.title}</h2>
                                    <div className="flex items-center gap-3">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Content Block</p>
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-100 text-[10px] font-black text-zinc-500">
                                            <Clock className="size-3" />
                                            {calculateReadingTime(selectedItem.content)} MIN READ
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 bg-zinc-50 p-1.5 rounded-[1.5rem] border border-zinc-100 shadow-sm">
                                        <button
                                            onClick={() => handlePlayPause(selectedItem.content)}
                                            className={`p-2.5 rounded-xl transition-all ${(isSpeaking || isPaused) ? 'bg-orange-100 text-orange-600 shadow-sm' : 'text-zinc-400 hover:bg-white hover:text-zinc-600'}`}
                                            title={isSpeaking ? "Pause" : (isPaused ? "Resume" : "Play")}
                                        >
                                            {isSpeaking ? <Pause className="size-5" /> : <Play className="size-5" />}
                                        </button>
                                        {(isSpeaking || isPaused) && (
                                            <button
                                                onClick={handleStop}
                                                className="p-2.5 rounded-xl text-zinc-400 hover:bg-white hover:text-red-500 transition-all"
                                                title="Stop"
                                            >
                                                <Square className="size-5" />
                                            </button>
                                        )}
                                    </div>
                                    <button onClick={() => setSelectedItem(null)} className="rounded-2xl p-3 bg-zinc-50 hover:bg-zinc-100 transition-colors"><X className="size-6" /></button>
                                </div>
                            </div>
                            <div className="prose prose-zinc max-w-none dark:prose-invert">
                                <div
                                    className="text-lg leading-relaxed text-zinc-600 font-medium"
                                    dangerouslySetInnerHTML={{ __html: memoizedContent }}
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
