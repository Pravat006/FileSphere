"use client"

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const plans = [
    {
        name: "Starter",
        price: "$0",
        description: "Perfect for personal use and exploring.",
        features: ["5GB Secure Storage", "Basic Search", "Single Device Sync", "Community Support"],
        highlight: false
    },
    {
        name: "Pro",
        price: "$12",
        description: "For creators and power users.",
        features: ["100GB Secure Storage", "AI-Powered Search", "Unlimited Device Sync", "Priority Support", "File Versioning"],
        highlight: true
    },
    {
        name: "Business",
        price: "Custom",
        description: "Scale without limits for your team.",
        features: ["Unlimited Storage", "Advanced Admin Control", "API Access", "Dedicated Manager", "SLA Guarantee"],
        highlight: false
    }
];

export default function Pricing() {
    return (
        <section id="pricing" className="py-32 px-8 bg-white relative overflow-hidden">
            <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-50 rounded-full blur-[120px] pointer-events-none opacity-50" />

            <div className="container mx-auto max-w-7xl">
                <div className="text-center space-y-4 mb-20">
                    <motion.span
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest"
                    >
                        Pricing
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900"
                    >
                        Simple, Transparent <span className="text-ocean-blue">Pricing.</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-lg text-gray-500 font-medium"
                    >
                        Choose the monthly plan that fits your digital world. No hidden fees.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {plans.map((plan, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            viewport={{ once: true }}
                            className={`relative p-10 rounded-[2.5rem] border ${plan.highlight ? 'border-ocean-blue bg-white shadow-2xl scale-105 z-10' : 'border-gray-100 bg-gray-50/50'} transition-all duration-500 flex flex-col`}
                        >
                            {plan.highlight && (
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-ocean-blue text-white text-[10px] font-black uppercase rounded-full tracking-widest shadow-xl">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-10 text-center sm:text-left">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1 justify-center sm:justify-start">
                                    <span className="text-5xl font-black text-gray-900">{plan.price}</span>
                                    {plan.price !== 'Custom' && <span className="text-gray-400 font-bold text-sm">/mo</span>}
                                </div>
                                <p className="mt-4 text-gray-500 font-medium leading-relaxed text-sm">{plan.description}</p>
                            </div>

                            <ul className="space-y-4 mb-10 flex-grow">
                                {plan.features.map((feature, j) => (
                                    <li key={j} className="flex items-center gap-3 text-sm font-semibold text-gray-600">
                                        <div className={`w-5 h-5 rounded-full ${plan.highlight ? 'bg-ocean-blue/10 text-ocean-blue' : 'bg-gray-200 text-gray-400'} flex items-center justify-center flex-shrink-0`}>
                                            <Check className="w-3 h-3 stroke-[3]" />
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>


                            <button
                                className={`w-full h-14 rounded-2xl font-bold text-lg transition-all active:scale-95 ${plan.highlight ? 'bg-ocean-blue text-white hover:bg-ocean-blue/90 shadow-xl shadow-ocean-blue/20' : 'bg-transparent border border-gray-200 text-gray-900 hover:bg-white hover:border-ocean-blue hover:text-ocean-blue'}`}
                            >
                                {plan.name === 'Business' ? 'Contact Sales' : 'Get Started'}
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
