import { TransactionStatusEnum } from "@/constants";
import z from "zod";

export const transactionSchema = z.object({
    id: z.string().cuid(),
    price: z.number().int().min(0),
    ownerId: z.string().cuid(),
    status: TransactionStatusEnum.default("PENDING"),
    razorpayOrderId: z.string().nullable(),
    razorpayPaymentId: z.string().nullable(),
    razorpaySignature: z.string().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const createTransactionSchema = z.object({
    price: z.number().int().min(1, "price amount required"),
    ownerId: z.string().cuid().min(1, "Owner id required"),
    status: TransactionStatusEnum.default("PENDING"),
    razorpayOrderId: z.string().optional(),
    razorpayPaymentId: z.string().optional(),
    razorpaySignature: z.string().optional(),
})

export const updateTransactionSchema = z.object({
    status: TransactionStatusEnum.optional(),
    razorpayOrderId: z.string().optional(),
    razorpayPaymentId: z.string().optional(),
    razorpaySignature: z.string().optional(),
});

export type Transaction = z.infer<typeof transactionSchema>

export type CreateTransaction = z.infer<typeof createTransactionSchema>

export type UpdateTransaction = z.infer<typeof updateTransactionSchema>