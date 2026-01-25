"use client"

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";

export default function Hero() {
    return (
        <section className="relative pt-32 pb-24 px-8 overflow-hidden min-h-screen flex flex-col items-center bg-gradient-to-b from-cloudy-sky/30 to-transparent">
            <div className="container mx-auto max-w-7xl relative z-10">
                <div className="flex flex-col items-center text-center space-y-8 mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gray-100 shadow-sm text-sm font-semibold text-gray-600"
                    >
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                                    <div className="w-full h-full bg-ocean-blue/20" />
                                </div>
                            ))}
                        </div>
                        <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            Trusted by 50,000+ users
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tighter text-gray-900 max-w-4xl"
                    >
                        Store your digital life <br />
                        <span className="text-ocean-blue">Stay in flow.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl text-gray-500 max-w-2xl font-medium"
                    >
                        FileSphere is the simplest, most intuitive cloud storage for teams and individuals. Focus on what matters, we'll handle the bits.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col sm:row items-center gap-4"
                    >
                        <button className="flex items-center justify-center gap-2 h-14 px-8 text-lg font-bold text-white bg-ocean-blue hover:bg-ocean-blue/90 rounded-full shadow-xl shadow-ocean-blue/20 transition-colors">
                            Start for Free <ArrowRight className="w-5 h-5" />
                        </button>
                        <button className="h-14 px-8 text-lg font-bold text-gray-900 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                            Contact Sales
                        </button>
                    </motion.div>
                </div>

                {/* Dashboard Preview mockup area */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="relative max-w-5xl mx-auto"
                >
                    <div className="absolute inset-0 bg-blue-400/10 blur-[100px] -z-10 rounded-full" />
                    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transform group-hover:scale-[1.02] transition-transform duration-700">
                        {/* Mockup UI using image */}
                        <div className="relative aspect-[16/10] bg-gray-50 overflow-hidden">
                            <Image
                                src="/hero.png"
                                alt="FileSphere Dashboard"
                                fill
                                className="object-cover object-top opacity-90"
                            />

                            {/* Floating UI Cards */}
                            <div className="absolute top-10 right-10 w-48 p-4 bg-white rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 animate-bounce-slow">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Storage</p>
                                    <p className="text-sm font-bold text-gray-900">1.2 GB / 5 GB</p>
                                </div>
                            </div>

                            <div className="absolute bottom-10 left-10 w-56 p-4 bg-white rounded-2xl shadow-xl border border-gray-100 space-y-3 animate-float">
                                <div className="flex justify-between items-center">
                                    <p className="text-sm font-bold text-gray-900">Recent Uploads</p>
                                    <div className="w-2 h-2 rounded-full bg-ocean-blue animate-pulse" />
                                </div>
                                <div className="space-y-2">
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full w-2/3 bg-ocean-blue" />
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium tracking-tight">Project_Final_v2.zip • 67%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
