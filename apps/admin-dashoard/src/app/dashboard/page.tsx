"use client"

import { motion } from "framer-motion"
import { Package, Users, Database, TrendingUp } from "lucide-react"

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            <div className="space-y-1">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Admin Dashboard</h1>
                <p className="text-gray-500 font-medium tracking-wide">Overview of your platform's performance and stats.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total Users", value: "12,482", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Active Plans", value: "3", icon: Package, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Storage Used", value: "84.2 TB", icon: Database, color: "text-purple-600", bg: "bg-purple-50" },
                    { label: "Revenue", value: "$42,850", icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-50" },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-6  bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12  ${stat.bg} ${stat.color} flex items-center justify-center`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="p-8  bg-white border border-gray-100 shadow-sm h-80 flex items-center justify-center text-gray-400 font-bold italic">
                    Activity Chart Placeholder
                </div>
                <div className="p-8  bg-white border border-gray-100 shadow-sm h-80 flex items-center justify-center text-gray-400 font-bold italic">
                    Recent Users Placeholder
                </div>
            </div>
        </div>
    )
}
