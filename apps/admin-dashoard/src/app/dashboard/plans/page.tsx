"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Plus,
    Pencil,
    Trash2,
    Check,
    Package,
    Database,
    DollarSign,
    AlertCircle,
    Loader2
} from "lucide-react"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { planService, SubscriptionPlan } from "@/services/plan.service"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"

const planFormSchema = z.object({
    planType: z.enum(["FREE", "PRO", "ENTERPRISE"]),
    price: z.coerce.number().min(0),
    storageLimit: z.coerce.number().min(1), // In GB
    features: z.string().min(1, "Enter at least one feature (comma separated)")
})

type PlanFormValues = z.infer<typeof planFormSchema>

export default function PlansPage() {
    const [isOpen, setIsOpen] = useState(false)
    const router = useRouter()
    const queryClient = useQueryClient()

    const { data: plans = [], isLoading: loading } = useQuery({
        queryKey: ["plans"],
        queryFn: async () => {
            const res = await planService.getAll()
            return res.data
        }
    })

    const createMutation = useMutation({
        mutationFn: (data: any) => planService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["plans"] })
            setIsOpen(false)
            form.reset()
        }
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => planService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["plans"] })
        }
    })

    const form = useForm<PlanFormValues>({
        resolver: zodResolver(planFormSchema) as any,
        defaultValues: {
            planType: "PRO",
            price: 0,
            storageLimit: 5,
            features: ""
        }
    })

    const onSubmit = async (values: PlanFormValues) => {
        const formattedData = {
            ...values,
            storageLimit: values.storageLimit * 1024 * 1024 * 1024, // Convert GB to Bytes
            features: values.features.split(",").map(f => f.trim()).filter(f => f !== "")
        }
        createMutation.mutate(formattedData)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this plan?")) return
        deleteMutation.mutate(id)
    }

    const actionLoading = createMutation.isPending || deleteMutation.isPending;

    const formatSize = (bytes: string) => {
        const gb = Number(bytes) / (1024 * 1024 * 1024)
        return gb >= 1024 ? `${(gb / 1024).toFixed(1)} TB` : `${gb} GB`
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <Package className="w-8 h-8 text-ocean-blue" />
                        Subscription Plans
                    </h1>
                    <p className="text-gray-500 font-medium tracking-wide">
                        Manage your service offerings and storage limits
                    </p>
                </div>

                <Dialog open={isOpen} onOpenChange={(open) => {
                    setIsOpen(open)
                    if (!open) {
                        form.reset()
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button className="h-12 px-6 bg-ocean-blue hover:bg-ocean-blue/90 text-white shadow-lg shadow-ocean-blue/20 flex items-center gap-2 font-bold transition-transform active:scale-95">
                            <Plus className="w-5 h-5" />
                            Create Plan
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg bg-white border-none shadow-2xl">
                        <DialogHeader className="pb-4">
                            <DialogTitle className="text-2xl font-black">
                                Create New Plan
                            </DialogTitle>
                            <DialogDescription className="font-medium text-gray-500">
                                Set the pricing and features for your users.
                            </DialogDescription>
                        </DialogHeader>

                        <Form {...(form as any)}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                                <FormField
                                    control={form.control}
                                    name="planType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-black uppercase tracking-widest text-gray-400">Plan Type</FormLabel>
                                            <FormControl>
                                                <div className="grid grid-cols-3 gap-3">
                                                    {["FREE", "PRO", "ENTERPRISE"].map((type) => (
                                                        <button
                                                            key={type}
                                                            type="button"
                                                            onClick={() => field.onChange(type)}
                                                            className={`h-11 xl text-xs font-bold transition-all border ${field.value === type
                                                                ? "bg-ocean-blue border-ocean-blue text-white shadow-lg shadow-ocean-blue/20"
                                                                : "bg-gray-50 border-gray-100 text-gray-500 hover:border-gray-300"
                                                                }`}
                                                        >
                                                            {type}
                                                        </button>
                                                    ))}
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="price"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-black uppercase tracking-widest text-gray-400">Price ($/mo)</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                        <Input
                                                            className="pl-9 h-12  border-gray-100 bg-gray-50 focus:bg-white font-bold"
                                                            type="number"
                                                            {...field}
                                                            onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="storageLimit"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-black uppercase tracking-widest text-gray-400">Storage (GB)</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Database className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                        <Input
                                                            className="pl-9 h-12  border-gray-100 bg-gray-50 focus:bg-white font-bold"
                                                            type="number"
                                                            {...field}
                                                            onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="features"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-black uppercase tracking-widest text-gray-400">Features (Comma separated)</FormLabel>
                                            <FormControl>
                                                <textarea
                                                    className="w-full min-h-[120px] p-4  border border-gray-100 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-ocean-blue/20 font-medium text-sm transition-all"
                                                    placeholder="5GB Storage, AI Search, Multi-device..."
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="pt-4 flex gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-12 flex-1  font-bold border-gray-100"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="h-12 flex-1  font-bold bg-ocean-blue text-white shadow-lg shadow-ocean-blue/20"
                                        disabled={actionLoading}
                                    >
                                        {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Plan"}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-[460px]  bg-gray-50 animate-pulse border border-gray-100" />
                    ))}
                </div>
            ) : (
                <AnimatePresence mode="popLayout">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {plans.length === 0 ? (
                            <div className="col-span-full py-32 text-center space-y-4 bg-gray-50/50  border border-dashed border-gray-200">
                                <div className="w-16 h-16 bg-white  shadow-sm border border-gray-50 flex items-center justify-center mx-auto">
                                    <AlertCircle className="w-8 h-8 text-gray-300" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-gray-900 leading-none">No Plans Yet</h3>
                                    <p className="text-gray-500 font-medium">Create your first subscription plan to get started.</p>
                                </div>
                            </div>
                        ) : (
                            plans.map((plan: SubscriptionPlan, i: number) => (
                                <motion.div
                                    key={plan.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className={`group relative p-8 ] bg-white border ${plan.planType === 'PRO' ? 'border-ocean-blue shadow-2xl z-10' : 'border-gray-100 shadow-sm'
                                        } flex flex-col transition-all duration-300 hover:translate-y-[-8px]`}
                                >
                                    <div className="flex items-center justify-between mb-8">
                                        <div className={`px-4 py-1.5  text-[10px] font-black tracking-widest uppercase ${plan.planType === 'FREE' ? 'bg-gray-100 text-gray-500' :
                                            plan.planType === 'PRO' ? 'bg-ocean-blue text-white' :
                                                'bg-purple-600 text-white'
                                            }`}>
                                            {plan.planType}
                                        </div>

                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <button
                                                            onClick={() => router.push(`/dashboard/plans/${plan.id}`)}
                                                            className="w-9 h-9 flex items-center justify-center bg-gray-50 text-gray-500 hover:bg-ocean-blue hover:text-white transition-colors"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Edit Plan</TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <button
                                                            onClick={() => handleDelete(plan.id)}
                                                            className="w-9 h-9 flex items-center justify-center  bg-gray-50 text-gray-500 hover:bg-red-500 hover:text-white transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Delete Plan</TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-5xl font-black text-gray-900">${plan.price}</span>
                                            <span className="text-gray-400 font-bold text-sm">/mo</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-ocean-blue font-black tracking-wide text-sm bg-ocean-blue/5 py-2 px-4  self-start">
                                            <Database className="w-4 h-4" />
                                            {formatSize(plan.storageLimit)} Storage
                                        </div>
                                    </div>

                                    <Separator className="mb-8 opacity-50" />

                                    <ul className="space-y-4 grow mb-8">
                                        {plan.features.map((feature: string, j: number) => (
                                            <li key={j} className="flex items-center gap-3 text-sm font-bold text-gray-600">
                                                <div className="shrink-0 w-5 h-5  bg-ocean-blue/10 text-ocean-blue flex items-center justify-center">
                                                    <Check className="w-2.5 h-2.5 stroke-4" />
                                                </div>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                                        Last updated: {new Date(plan.updatedAt).toLocaleDateString()}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </motion.div>
                </AnimatePresence>
            )}
        </div>
    )
}
