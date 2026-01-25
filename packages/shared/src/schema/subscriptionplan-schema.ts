import { planTypeEnum } from "../constants";
import z from "zod";


export const subscriptionSchema = z.object({
    id: z.string(),
})

export const subscriptionPlanSchema = z.object({
    id: z.string().cuid(),
    planType: planTypeEnum.default("FREE"),
    price: z.number().int().nonnegative().min(0).default(0),
    storageLimit: z.any().transform((val) => BigInt(val)).default(BigInt(1073741824)),
    features: z.array(z.string()).default([]),
    createdAt: z.date(),
    updatedAt: z.date(),
    adminId: z.string().cuid()
})

export const createSubscriptionPlanSchema = z.object({
    planType: planTypeEnum,
    price: z.number().default(0),
    storageLimit: z.any().transform((val) => BigInt(val)).default(BigInt(1073741824)),
    features: z.array(z.string()).default([]),
    adminId: z.string().cuid().optional()
})

export const updateSubscriptionPlanSchema = z.object({
    price: z.number().int().min(0).optional(),
    storageLimit: z.any().transform((val) => BigInt(val)).optional(),
    features: z.array(z.string()).optional()
})


export type SubscriptionSchema = z.infer<typeof subscriptionSchema>;
export type SubscriptionPlanSchema = z.infer<typeof subscriptionPlanSchema>;
export type CreateSubscriptionPlanSchema = z.infer<typeof createSubscriptionPlanSchema>;
export type UpdateSubscriptionPlanSchema = z.infer<typeof updateSubscriptionPlanSchema>;

// Request types for backend
export type CreateSubscriptionPlanRequest = CreateSubscriptionPlanSchema;
export type UpdateSubscriptionPlanRequest = UpdateSubscriptionPlanSchema;
