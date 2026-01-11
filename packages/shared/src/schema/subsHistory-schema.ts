import z from "zod";

export const createSubscriptionHistorySchema = z.object({
    userId: z.string().cuid(),
    planId: z.string().cuid(),
    startDate: z.date().optional(), // defaults to now() in DB
    endDate: z.date().optional(),
    transactionId: z.string().cuid().optional()
})


export const subscriptionHistorySchema = z.object({
    id: z.string().cuid(),
    userId: z.string().cuid(),
    planId: z.string().cuid(),
    startDate: z.date(),
    endDate: z.date().nullable(),
    transactionId: z.string().cuid().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
});


export type SubscriptionHistory = z.infer<typeof subscriptionHistorySchema>
export type CreateSubscriptionHistory = z.infer<typeof createSubscriptionHistorySchema>

