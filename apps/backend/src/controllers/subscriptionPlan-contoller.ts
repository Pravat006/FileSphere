import prisma from "@repo/db";
import { CreateSubscriptionPlanRequest } from "@repo/shared";
import { Request, Response } from "express";
import { serializeBigInt } from "@/utils/serialize-bigint";

const createSubscriptionPlan = async (req: Request, res: Response) => {
    try {
        const { type, price, storageLimit, features } = req.body as CreateSubscriptionPlanRequest

        console.log('Creating plan with data:', { type, price, storageLimit, features });

        // check if there is plan exist before with same subscription plan type
        const existingPlan = await prisma.subscriptionPlan.findFirst({
            where: {
                type: type
            }
        })

        if (existingPlan) {
            return res.status(400).json({
                "success": false,
                "message": "Subscription plan with this type already exists"
            })
        }

        const plan = await prisma.subscriptionPlan.create({
            data: {
                type,
                price,
                storageLimit,
                features
            }
        })

        res.status(201).json({
            "success": true,
            "data": serializeBigInt(plan),
            "message": "Subscription plan created successfully"
        })

    } catch (error) {
        console.error('Error creating subscription plan:', error);
        res.status(500).json({
            "success": false,
            "message": "Internal server error",
            "error": process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
        })
    }
}

const deleteSubscriptionPlan = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const plan = await prisma.subscriptionPlan.findUnique({
            where: {
                id
            }
        })
        if (!plan) {
            return res.status(404).json({
                "success": false,
                "message": "Subscription plan not found"
            })
        }
        await prisma.subscriptionPlan.delete({
            where: {
                id
            }
        })
        res.status(200).json({
            "success": true,
            "message": "Subscription plan deleted successfully"
        })
    } catch (error) {
        console.error('Error deleting subscription plan:', error);
        res.status(500).json({
            "success": false,
            "message": "Internal server error"
        })
    }
}

const updateSubscriptionPlan = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const { price, storageLimit, features } = req.body as Partial<CreateSubscriptionPlanRequest>
        const plan = await prisma.subscriptionPlan.findUnique({
            where: {
                id
            }
        })
        if (!plan) {
            return res.status(404).json({
                "success": false,
                "message": "Subscription plan not found"
            })
        }
        const updatedPlan = await prisma.subscriptionPlan.update({
            where: {
                id
            },
            data: {
                price,
                storageLimit,
                features
            }
        })
        res.status(200).json({
            "success": true,
            "data": serializeBigInt(updatedPlan), // Serialize BigInt
            "message": "Subscription plan updated successfully"
        })
    } catch (error) {
        console.error('Error updating subscription plan:', error);
        res.status(500).json({
            "success": false,
            "message": "Internal server error"
        })
    }
}

const getSubscriptionPlans = async (req: Request, res: Response) => {
    try {
        const plans = await prisma.subscriptionPlan.findMany()
        res.status(200).json({
            "success": true,
            "data": serializeBigInt(plans), // Serialize BigInt
            "message": "Subscription plans fetched successfully"
        })
    } catch (error) {
        console.error('Error fetching subscription plans:', error);
        res.status(500).json({
            "success": false,
            "message": "Internal server error"
        })
    }
}

export { createSubscriptionPlan, getSubscriptionPlans, deleteSubscriptionPlan, updateSubscriptionPlan }

