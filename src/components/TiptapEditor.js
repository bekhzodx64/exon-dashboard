"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    List,
    ListOrdered,
    Quote,
    Heading1,
    Heading2,
    Undo,
    Redo,
    Code,
    Link as LinkIcon,
    X,
    Check
} from 'lucide-react';

const MenuBar = ({ editor, onLinkClick }) => {
    if (!editor) return null;

    const items = [
        { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), isActive: editor.isActive('bold'), title: 'Bold' },
        { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), isActive: editor.isActive('italic'), title: 'Italic' },
        { icon: UnderlineIcon, action: () => editor.chain().focus().toggleUnderline().run(), isActive: editor.isActive('underline'), title: 'Underline' },
        { icon: LinkIcon, action: onLinkClick, isActive: editor.isActive('link'), title: 'Link' },
        { type: 'divider' },
        { icon: Heading1, action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), isActive: editor.isActive('heading', { level: 1 }), title: 'Heading 1' },
        { icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: editor.isActive('heading', { level: 2 }), title: 'Heading 2' },
        { type: 'divider' },
        { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), isActive: editor.isActive('bulletList'), title: 'Bullet List' },
        { icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), isActive: editor.isActive('orderedList'), title: 'Ordered List' },
        { type: 'divider' },
        { icon: Quote, action: () => editor.chain().focus().toggleBlockquote().run(), isActive: editor.isActive('blockquote'), title: 'Blockquote' },
        { icon: Code, action: () => editor.chain().focus().toggleCodeBlock().run(), isActive: editor.isActive('codeBlock'), title: 'Code Block' },
        { type: 'divider' },
        { icon: Undo, action: () => editor.chain().focus().undo().run(), title: 'Undo' },
        { icon: Redo, action: () => editor.chain().focus().redo().run(), title: 'Redo' }
    ];

    return (
        <div className="flex flex-wrap items-center gap-1 p-2 mb-2 rounded-2xl bg-zinc-100/50 border border-zinc-200 dark:bg-zinc-800/50 dark:border-zinc-700">
            {items.map((item, index) => {
                if (item.type === 'divider') {
                    return <div key={index} className="w-px h-6 mx-1 bg-zinc-300 dark:bg-zinc-700 shadow-sm" />;
                }
                const Icon = item.icon;
                return (
                    <button
                        key={index}
                        type="button"
                        onClick={item.action}
                        title={item.title}
                        className={`p-2 rounded-xl transition-all duration-200 ${
                            item.isActive 
                            ? 'bg-zinc-900 text-white shadow-md' 
                            : 'text-zinc-500 hover:bg-white hover:text-zinc-900 hover:shadow-sm dark:hover:bg-zinc-800/80 dark:hover:text-zinc-100'
                        }`}
                    >
                        <Icon className="size-4" />
                    </button>
                );
            })}
        </div>
    );
};

export default function TiptapEditor({ content, onChange }) {
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3]
                }
            }),
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-orange-500 underline decoration-orange-200 decoration-2 underline-offset-4 font-bold cursor-pointer transition-all hover:text-orange-600'
                }
            }),
        ],
        immediatelyRender: false,
        content: content || '',
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-zinc dark:prose-invert max-w-none focus:outline-none'
            }
        }
    });

    const openLinkInput = useCallback(() => {
        const previousUrl = editor.getAttributes('link').href;
        setLinkUrl(previousUrl || '');
        setShowLinkInput(true);
    }, [editor]);

    const setLink = useCallback(() => {
        if (linkUrl === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
        } else {
            editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
        }
        setShowLinkInput(false);
        setLinkUrl('');
    }, [editor, linkUrl]);

    return (
        <div className="w-full flex flex-col">
            <MenuBar editor={editor} onLinkClick={openLinkInput} />
            
            <AnimatePresence>
                {showLinkInput && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mb-4 flex items-center gap-2 rounded-[1.5rem] bg-zinc-900 p-2 shadow-xl">
                            <input
                                autoFocus
                                type="url"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') { e.preventDefault(); setLink(); }
                                    if (e.key === 'Escape') setShowLinkInput(false);
                                }}
                                placeholder="Paste or type link URL..."
                                className="flex-1 bg-transparent px-4 py-2 text-sm font-bold text-white placeholder:text-zinc-500 outline-none"
                            />
                            <div className="flex items-center gap-1 pr-1">
                                <button
                                    onClick={setLink}
                                    className="flex size-9 items-center justify-center rounded-xl bg-orange-500 text-white transition-all hover:bg-orange-600 hover:scale-105 active:scale-95"
                                >
                                    <Check className="size-4" />
                                </button>
                                <button
                                    onClick={() => setShowLinkInput(false)}
                                    className="flex size-9 items-center justify-center rounded-xl bg-zinc-800 text-zinc-400 transition-all hover:bg-zinc-700 hover:text-white"
                                >
                                    <X className="size-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div 
                className="min-h-[350px] w-full rounded-[2.5rem] border-2 border-zinc-100 bg-white p-8 transition-all hover:border-zinc-200 focus-within:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/50"
                onClick={() => editor?.chain().focus().run()}
            >
                <EditorContent editor={editor} />
            </div>
            
            <style jsx global>{`
                .tiptap p.is-editor-empty:first-child::before {
                    content: 'Type your content here...';
                    float: left;
                    color: #94a3b8;
                    pointer-events: none;
                    height: 0;
                    font-style: italic;
                }
                .tiptap {
                    min-height: 250px;
                    outline: none !important;
                }
                .tiptap ul { list-style-type: disc; padding-left: 1.5rem; }
                .tiptap ol { list-style-type: decimal; padding-left: 1.5rem; }
            `}</style>
        </div>
    );
}
