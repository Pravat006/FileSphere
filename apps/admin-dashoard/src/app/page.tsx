"use client"

import { motion } from "framer-motion";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Pricing from "@/components/landing/Pricing";
import Footer from "@/components/landing/Footer";


import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  return (
    <main className="min-h-screen bg-white text-gray-900 selection:bg-ocean-blue/10 selection:text-ocean-blue">
      <Navbar />

      <div className="relative">
        <Hero />

        {/* Ad-like transition section (Marquee) */}
        <section className="py-12 bg-ocean-blue overflow-hidden whitespace-nowrap">
          <div className="flex animate-marquee hover:pause gap-12 text-2xl font-black uppercase tracking-[0.2em] italic text-cloudy-sky opacity-80">
            <span>• Secure Cloud Storage • Fast Uploads • Global Access • Smart Search • Real-time Sync • Infinite Scaling • </span>
            <span>• Secure Cloud Storage • Fast Uploads • Global Access • Smart Search • Real-time Sync • Infinite Scaling • </span>
          </div>
        </section>

        <Features />

        {/* Integrations Section (Inspired by frame 4 of the image) */}
        <section className="py-32 px-8 bg-white overflow-hidden">
          <div className="container mx-auto max-w-7xl text-center space-y-16">
            <div className="space-y-4">
              <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest"
              >
                Integrations
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-extrabold tracking-tight"
              >
                Connect your favorite <br />
                <span className="text-ocean-blue">tools seamlessly.</span>
              </motion.h2>
            </div>

            <div className="relative py-20 flex justify-center">
              {/* Decorative semi-circle background */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-dashed border-gray-200 rounded-full -z-10" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-dashed border-gray-200 rounded-full -z-10" />

              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.05, 1], rotate: [0, 5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="w-24 h-24 bg-white rounded-3xl shadow-2xl border border-gray-100 flex items-center justify-center p-6 z-10"
                >
                  <div className="w-full h-full bg-ocean-blue rounded-xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </motion.div>

                {/* Floating logos (Placeholders) */}
                {[
                  { icon: "Slack", pos: "top-[-100px] left-[-200px]" },
                  { icon: "Drive", pos: "top-[-50px] left-[250px]" },
                  { icon: "Figma", pos: "bottom-[50px] left-[-250px]" },
                  { icon: "Notion", pos: "bottom-[-100px] right-[-200px]" }
                ].map((tool, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className={`absolute ${tool.pos} w-12 h-12 bg-white rounded-2xl shadow-lg border border-gray-50 flex items-center justify-center text-[10px] font-black italic text-gray-300`}
                  >
                    {tool.icon}
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="pt-10"
            >
              <button className="h-14 px-8 text-lg font-bold text-white bg-ocean-blue hover:bg-ocean-blue/90 rounded-full shadow-xl shadow-ocean-blue/20 transition-all hover:scale-105 active:scale-95">
                Get Started for Free
              </button>
            </motion.div>
          </div>
        </section>

        <Pricing />

        {/* CTA Section */}
        <section className="py-32 px-8 text-center relative overflow-hidden bg-ocean-blue">
          <div className="absolute inset-0 bg-white/5 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

          <div className="container mx-auto max-w-4xl space-y-12 relative z-10">
            <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-[1.1] text-white">
              Ready to Simplify <br />Your Digital Life?
            </h2>
            <p className="text-xl text-cloudy-sky font-medium opacity-80">
              Join 50,000+ creators and teams who trust FileSphere every day.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
              <button className="h-16 px-12 text-xl font-black text-ocean-blue bg-white hover:bg-cloudy-sky rounded-full shadow-2xl transition-transform active:scale-95">
                Start for Free
              </button>
              <button className="h-16 px-12 text-xl font-black text-white border border-white/20 hover:bg-white/10 rounded-full transition-colors">
                View Enterprise
              </button>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </main>
  );
}
