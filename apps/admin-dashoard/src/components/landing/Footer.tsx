"use client"

import Link from "next/link";
import { Cloud, Twitter, Github, Globe } from "lucide-react";

export default function Footer() {
    return (
        <footer className="pt-32 pb-12 px-8 bg-gray-50 border-t border-gray-100 relative overflow-hidden">
            <div className="container mx-auto max-w-7xl relative z-10">
                <div className="grid md:grid-cols-4 gap-16 mb-24">
                    <div className="col-span-1 md:col-span-1 space-y-8">
                        <div className="flex items-center gap-2 group">
                            <div className="w-8 h-8 bg-ocean-blue rounded-lg flex items-center justify-center shadow-md">
                                <Cloud className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-ocean-blue">
                                FileSphere
                            </span>
                        </div>
                        <p className="text-gray-500 text-sm leading-relaxed font-medium">
                            Join thousands of teams who trust FileSphere for their critical project data and personal files.
                        </p>
                        <div className="flex gap-4">
                            {[
                                { icon: Twitter, href: "#" },
                                { icon: Github, href: "#" },
                                { icon: Globe, href: "#" }
                            ].map((social, i) => (
                                <a key={i} href={social.href} className="w-9 h-9 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-ocean-blue hover:border-ocean-blue transition-all">
                                    <social.icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Platform</h4>
                        <ul className="space-y-4 text-gray-400 text-sm font-semibold">
                            <li><Link href="#features" className="hover:text-ocean-blue transition-colors">Features</Link></li>
                            <li><Link href="/signin" className="hover:text-ocean-blue transition-colors">Sign In</Link></li>
                            <li><Link href="/signin" className="hover:text-ocean-blue transition-colors">Create Account</Link></li>
                            <li><Link href="#" className="hover:text-ocean-blue transition-colors">API Documentation</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Company</h4>
                        <ul className="space-y-4 text-gray-400 text-sm font-semibold">
                            <li><Link href="#" className="hover:text-ocean-blue transition-colors">About Us</Link></li>
                            <li><Link href="#" className="hover:text-ocean-blue transition-colors">Careers</Link></li>
                            <li><Link href="#" className="hover:text-ocean-blue transition-colors">Blog</Link></li>
                            <li><Link href="#" className="hover:text-ocean-blue transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Newsletter</h4>
                        <p className="text-gray-500 text-sm font-medium">Get the latest updates on features and security.</p>
                        <div className="flex gap-2 p-1 bg-white border border-gray-100 rounded-xl">
                            <input type="email" placeholder="Email address" className="bg-transparent px-3 text-sm flex-grow outline-none text-gray-900 font-medium" />
                            <button className="bg-ocean-blue text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-ocean-blue/90 transition-all">Join</button>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-100 flex flex-col md:row items-center justify-between gap-4 text-xs font-bold text-gray-400 tracking-widest">
                    <p>© 2026 FILESPHERE INC. ALL RIGHTS RESERVED.</p>
                    <div className="flex gap-8">
                        <Link href="#" className="hover:text-ocean-blue transition-colors">PRIVACY</Link>
                        <Link href="#" className="hover:text-ocean-blue transition-colors">TERMS</Link>
                        <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> SYSTEMS OK</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
