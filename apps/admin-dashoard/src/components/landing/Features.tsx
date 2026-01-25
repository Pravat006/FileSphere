"use client"

import { motion } from "framer-motion";
import { Shield, Globe, Zap, Clock, Smartphone, Share2 } from "lucide-react";
import Image from "next/image";

const features = [
    {
        title: "Military-Grade Security",
        description: "End-to-end encryption ensure your files remain yours alone. Protected by industry-standard protocols.",
        icon: Shield,
        color: "text-blue-600",
        bg: "bg-blue-50"
    },
    {
        title: "Global Edge Network",
        description: "Ultra-fast uploads and downloads powered by a global backbone with zero latency on every device.",
        icon: Globe,
        color: "text-ocean-blue",
        bg: "bg-blue-50"
    },
    {
        title: "Instant Synchronization",
        description: "Changes on one device are instantly reflected everywhere. Seamless transition between workspaces.",
        icon: Zap,
        color: "text-yellow-600",
        bg: "bg-yellow-50"
    },
    {
        title: "File Versioning",
        description: "Never lose a draft again. Access 30 days of history for any file and restore with a single click.",
        icon: Clock,
        color: "text-emerald-600",
        bg: "bg-emerald-50"
    },
    {
        title: "Mobile First Access",
        description: "Our mobile app lets you manage and share files from anywhere. Clean and responsive interface.",
        icon: Smartphone,
        color: "text-indigo-600",
        bg: "bg-indigo-50"
    },
    {
        title: "Seamless Teamwork",
        description: "Add collaborators to folders with granular permissions. Real-time activity tracking.",
        icon: Share2,
        color: "text-rose-600",
        bg: "bg-rose-50"
    }
];

export default function Features() {
    return (
        <section id="features" className="py-32 px-8 bg-gray-50/50">
            <div className="container mx-auto max-w-7xl">
                <div className="text-center space-y-4 mb-20">
                    <motion.span
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest"
                    >
                        Capabilities
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900"
                    >
                        Everything you need to <br />
                        <span className="text-ocean-blue">stay organized.</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-gray-500 max-w-2xl mx-auto font-medium"
                    >
                        Clean, simple, and crafted to help you focus on your work instead of your browser.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <div className="group hover:shadow-xl transition-all duration-300 border border-gray-100 bg-white rounded-[2rem] overflow-hidden">
                                <div className="p-8 space-y-6 text-left">
                                    <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                                        <feature.icon className={`w-7 h-7 ${feature.color}`} />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                                        <p className="text-sm text-gray-500 leading-relaxed font-medium">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Horizontal Feature Highlight Section */}
                <div className="mt-40 grid md:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="space-y-8"
                    >
                        <div className="space-y-4">
                            <h3 className="text-4xl font-extrabold tracking-tight text-gray-900">Manage all your files <br />in one intuitive view.</h3>
                            <p className="text-gray-500 text-lg font-medium leading-relaxed">
                                Avoid the clutter. Our centralized control panel lets you monitor uploads, manage folders, and track access in real-time.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            {[
                                { label: "Storage Used", value: "78%", color: "text-blue-600" },
                                { label: "Active Shares", value: "14", color: "text-ocean-blue" },
                                { label: "Bandwidth", value: "Unlimited", color: "text-emerald-600" },
                                { label: "Security Score", value: "A+", color: "text-rose-600" }
                            ].map((stat, i) => (
                                <div key={i} className="space-y-1">
                                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{stat.label}</p>
                                    <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="relative"
                    >
                        <div className="absolute -inset-4 bg-cloudy-sky/30 rounded-[3rem] blur-2xl" />
                        <div className="relative bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden p-6">
                            <div className="bg-gray-50 rounded-2xl aspect-[4/3] flex items-center justify-center p-8">
                                <div className="w-full h-full relative">
                                    <Image src="/global.png" alt="Central Control" fill className="object-contain opacity-80" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
