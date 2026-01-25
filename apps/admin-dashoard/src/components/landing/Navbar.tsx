"use client"

import Link from "next/link";
import { motion } from "framer-motion";
import { Cloud } from "lucide-react";

export default function Navbar() {
    return (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 backdrop-blur-md bg-white/70 border-b border-gray-100 transition-all duration-300"
        >
            <div className="flex items-center gap-2 group">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-ocean-blue rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                        <Cloud className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-ocean-blue tracking-tight">
                        FileSphere
                    </span>
                </Link>
            </div>

            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
                <Link href="#features" className="hover:text-ocean-blue transition-colors">Features</Link>
                <Link href="#security" className="hover:text-ocean-blue transition-colors">Security</Link>
                <Link href="#pricing" className="hover:text-ocean-blue transition-colors">Pricing</Link>
            </div>

            <div className="flex items-center gap-4">
                <Link href="/signin" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-ocean-blue hover:bg-gray-100/50 rounded-md transition-colors">
                    Sign In
                </Link>
                <Link href="/signin" className="px-6 py-2 text-sm font-medium text-white bg-ocean-blue hover:bg-ocean-blue/90 rounded-full shadow-lg transition-all hover:shadow-xl active:scale-95">
                    Start for Free
                </Link>
            </div>
        </motion.nav>
    );
}
