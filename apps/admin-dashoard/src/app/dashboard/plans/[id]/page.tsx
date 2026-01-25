"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
    ArrowLeft,
    Database,
    DollarSign,
    Loader2,
    Save,
    Trash2
} from "lucide-react"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { planService, SubscriptionPlan } from "@/services/plan.service"
import { useRouter, useParams } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

const planFormSchema = z.object({
    price: z.coerce.number().min(0),
    storageLimit: z.coerce.number().min(1), // In GB
    features: z.string().min(1, "Enter at least one feature (comma separated)")
})

type PlanFormValues = z.infer<typeof planFormSchema>

export default function EditPlanPage() {
    const { id } = useParams() as { id: string }
    const router = useRouter()
    const queryClient = useQueryClient()

    const form = useForm<PlanFormValues>({
        resolver: zodResolver(planFormSchema) as any,
        defaultValues: {
            price: 0,
            storageLimit: 5,
            features: ""
        }
    })

    const { data: plans = [], isLoading: loading } = useQuery({
        queryKey: ["plans"],
        queryFn: async () => {
            const res = await planService.getAll()
            return res.data
        }
    })

    const plan = plans.find((p: SubscriptionPlan) => p.id === id)

    useEffect(() => {
        if (plan) {
            form.reset({
                price: plan.price,
                storageLimit: Math.round(Number(plan.storageLimit) / (1024 * 1024 * 1024)),
                features: plan.features.join(", ")
            })
        }
    }, [plan, form])

    const updateMutation = useMutation({
        mutationFn: (data: any) => planService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["plans"] })
            router.push("/dashboard/plans")
        }
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => planService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["plans"] })
            router.push("/dashboard/plans")
        }
    })

    const onSubmit = async (values: PlanFormValues) => {
        const formattedData = {
            price: values.price,
            storageLimit: values.storageLimit * 1024 * 1024 * 1024,
            features: values.features.split(",").map((f: string) => f.trim()).filter((f: string) => f !== "")
        }
        updateMutation.mutate(formattedData)
    }

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this plan?")) return
        deleteMutation.mutate(id)
    }

    const updating = updateMutation.isPending || deleteMutation.isPending;

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto space-y-8">
                <Skeleton className="h-10 w-48" />
                <div className="space-y-6 bg-white p-8 [2.5rem] border border-gray-100">
                    <Skeleton className="h-12 w-full" />
                    <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                    <Skeleton className="h-32 w-full" />
                </div>
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto space-y-8 pb-20"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push("/dashboard/plans")}
                        className="w-10 h-10 flex items-center justify-center  bg-gray-50 text-gray-400 hover:bg-gray-100 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 leading-none">Edit {plan?.planType} Plan</h1>
                        <p className="text-gray-500 font-medium text-sm mt-1">Modify pricing and limits</p>
                    </div>
                </div>

                <Button
                    variant="ghost"
                    className="text-red-500 hover:bg-red-50 hover:text-red-600 font-bold  h-10 gap-2"
                    onClick={handleDelete}
                    disabled={updating}
                >
                    <Trash2 className="w-4 h-4" />
                    Delete
                </Button>
            </div>

            <div className="bg-white p-10  border border-gray-100 shadow-xl shadow-gray-200/50">
                <Form {...(form as any)}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className={`inline-flex px-4 py-1.5  text-[10px] font-black tracking-widest uppercase ${plan?.planType === 'FREE' ? 'bg-gray-100 text-gray-500' :
                            plan?.planType === 'PRO' ? 'bg-ocean-blue text-white' :
                                'bg-purple-600 text-white'
                            }`}>
                            Current Plan: {plan?.planType}
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-black uppercase tracking-widest text-gray-400">Price ($/mo)</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <Input
                                                    className="pl-10 h-14  border-gray-100 bg-gray-50 focus:bg-white font-bold text-lg"
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
                                                <Database className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <Input
                                                    className="pl-10 h-14  border-gray-100 bg-gray-50 focus:bg-white font-bold text-lg"
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
                                            className="w-full min-h-[160px] p-6  border border-gray-100 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-ocean-blue/20 font-medium text-sm transition-all leading-relaxed"
                                            placeholder="5GB Storage, AI Search, Multi-device..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Separator className="opacity-50" />

                        <div className="flex gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="h-14 flex-1  font-bold border-gray-100 hover:bg-gray-50"
                                onClick={() => router.push("/dashboard/plans")}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="h-14 flex-1  font-bold bg-ocean-blue text-white shadow-xl shadow-ocean-blue/20"
                                disabled={updating}
                            >
                                {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                    <span className="flex items-center gap-2">
                                        <Save className="w-5 h-5" />
                                        Save Changes
                                    </span>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </motion.div>
    )
}
