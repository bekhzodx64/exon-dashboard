import {
    ArrowRight,
    BookOpen,
    FileText,
    Image as ImageIcon,
    Package,
    Search,
    Truck
} from "lucide-react";
import Link from "next/link";

const blocks = [
    {
        title: "Marketplace Setup",
        desc: "Comprehensive guide on creating product cards, SEO optimization, and pricing strategies for maximum visibility.",
        icon: Package,
        color: "bg-blue-600",
        href: "/materials/marketplace",
        items: ["New Card Creation", "SEO Keywords", "Competitor Pricing", "Category Matching"]
    },
    {
        title: "Shipping & Logistics",
        desc: "Everything about warehouse management, shipping labels, and cargo handling processes for efficient fulfillment.",
        icon: Truck,
        color: "bg-green-600",
        href: "/materials/shipping",
        items: ["Label Printing", "Box Packaging", "Courier Schedules", "Damage Claims"]
    },
    {
        title: "Image & Media",
        desc: "Professional editing guide for product photos, background removal, and brand-consistent visual layouts.",
        icon: ImageIcon,
        color: "bg-purple-600",
        href: "/materials/images",
        items: ["Batch Resizing", "Object Removal", "Infographic Design", "Watermarking"]
    },
    {
        title: "Customer Support",
        desc: "Templates and guidelines for talking to customers, handling returns, and managing reviews professionally.",
        icon: BookOpen,
        color: "bg-orange-600",
        href: "/materials/support",
        items: ["Review Responses", "Return Policies", "Conflict Resolution", "Tone of Voice"]
    }
];

export default function KnowledgeBase() {
    return (
        <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Header section */}
            <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-700 dark:bg-orange-950/30 dark:text-orange-400">
                        <GraduationCap className="size-3" />
                        Exon Learning Center
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 md:text-5xl">
                        Knowledge Base
                    </h1>
                    <p className="max-w-xl text-lg text-zinc-500 dark:text-zinc-400">
                        Select a module below to start your training session. Each guide contains step-by-step instructions.
                    </p>
                </div>

                {/* Local Search for Knowledge Base */}
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Find a specific guide..."
                        className="h-12 w-full rounded-2xl border border-border bg-white pl-12 pr-4 text-sm font-medium shadow-sm transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/30"
                    />
                </div>
            </div>

            {/* Grid of Knowledge Modules */}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2">
                {blocks.map((block, index) => {
                    const IconComp = block.icon;
                    return (
                        <Link
                            key={index}
                            href={block.href}
                            className="group relative flex flex-col overflow-hidden rounded-[2.5rem] border border-border bg-white transition-all hover:-translate-y-2 hover:border-orange-500/50 hover:shadow-[0_20px_50px_rgba(255,100,0,0.1)]"
                        >
                            <div className="p-8 md:p-10">
                                <div className="flex items-start justify-between">
                                    <div className={`flex h-16 w-16 items-center justify-center rounded-3xl ${block.color} text-white shadow-xl shadow-${block.color.split('-')[1]}-500/30 transition-transform group-hover:scale-110 duration-500`}>
                                        <IconComp className="size-8" />
                                    </div>
                                    <div className="flex items-center gap-1 overflow-hidden transition-all group-hover:gap-2">
                                        <span className="translate-x-full text-xs font-bold uppercase tracking-widest text-orange-600 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                                            Learn More
                                        </span>
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-50 transition-colors group-hover:bg-orange-500 group-hover:text-white">
                                            <ArrowRight className="size-5" />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <h3 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                                        {block.title}
                                    </h3>
                                    <p className="mt-2 text-zinc-500 dark:text-zinc-400">
                                        {block.desc}
                                    </p>
                                </div>

                                {/* Topics covered list */}
                                <div className="mt-8 flex flex-wrap gap-2">
                                    {block.items.map((item, i) => (
                                        <span key={i} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-zinc-50/50 px-3 py-1.5 text-xs font-semibold text-zinc-600">
                                            <FileText className="size-3 opacity-50" />
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Decorative background element */}
                            <div className={`absolute -right-4 -bottom-4 size-32 opacity-5 transition-transform group-hover:scale-150 duration-700 ${block.color} blur-3xl`} />
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

function GraduationCap(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
    );
}
