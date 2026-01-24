import prisma from "@/services/db";
import { CreateSubscriptionPlanRequest } from "@repo/shared";
import { ApiError } from "@/interface";
import status from "http-status";

class SubscriptionPlanService {

    /**
     * Create a new subscription plan
     */
    async createPlan(data: CreateSubscriptionPlanRequest, adminId: string) {
        try {
            // Check if plan with same type already exists
            const existingPlan = await prisma.subscriptionPlan.findFirst({
                where: { planType: data.planType }
            });

            if (existingPlan) {
                // We use HTTP 409 Conflict for duplicate resource
                throw new ApiError(status.CONFLICT, `Subscription plan with type '${data.planType}' already exists.`);
            }

            const plan = await prisma.subscriptionPlan.create({
                data: {
                    planType: data.planType,
                    price: data.price,
                    storageLimit: data.storageLimit,
                    features: data.features,
                    adminId: adminId
                }
            });
            return plan;
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError(status.INTERNAL_SERVER_ERROR, "Failed to create subscription plan", String(error));
        }
    }

    /**
     * Get all subscription plans
     */
    async getPlans() {
        try {
            const plans = await prisma.subscriptionPlan.findMany();
            return plans;
        } catch (error) {
            throw new ApiError(status.INTERNAL_SERVER_ERROR, "Failed to fetch subscription plans", String(error));
        }
    }

    /**
     * Get plan by ID
     */
    async getPlanById(id: string) {
        try {
            const plan = await prisma.subscriptionPlan.findUnique({
                where: { id }
            });

            if (!plan) {
                throw new ApiError(status.NOT_FOUND, "Subscription plan not found");
            }

            // 1. Active Subscriptions: Count of users currently on this plan (assuming user.planId is the current plan)
            const activeSubscriptions = await prisma.user.count({
                where: { planId: id }
            });

            // 2. Total Purchases: Count of subscription history entries for this plan
            const totalPurchases = await prisma.subscriptionHistory.count({
                where: { planId: id }
            });

            // 3. Revenue Generated: Sum of transaction prices linked to this plan
            const revenueResult = await prisma.transaction.aggregate({
                _sum: {
                    amount: true
                },
                where: {
                    subscriptionHistory: {
                        planId: id
                    },
                    status: 'SUCCESS'
                }
            });
            const revenueGenerated = revenueResult?._sum?.amount || 0;

            // Date for 30 days ago
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            // 4. New Subscriptions (30d): Subscription history entries created in the last 30 days
            const newSubscriptions30d = await prisma.subscriptionHistory.count({
                where: {
                    planId: id,
                    createdAt: {
                        gte: thirtyDaysAgo
                    }
                }
            });

            // 5. Churned Subscriptions (30d): 
            // Users who had this plan active but their subscription ended in the last 30 days 
            // AND they don't have a current active subscription to THIS plan.
            // Simplified approximation: History entries where endDate is in last 30 days.
            // For a more accurate churn, we'd check if they renewed or switched.
            // Let's stick to "Ended in last 30d" for now as a proxy.
            const churnedSubscriptions30d = await prisma.subscriptionHistory.count({
                where: {
                    planId: id,
                    endDate: {
                        gte: thirtyDaysAgo,
                        lte: new Date()
                    }
                }
            });

            // 6. Conversion Rate: (Paid Activations / Total Activations) * 100
            // Since this is a specific plan, "Conversion" might mean "Buying this plan".
            // If this is a PAID plan, we can compare it to total users or free plan users.
            // Let's define it as: (Total Purchases of This Plan / Total Users in System) * 100
            const totalUsers = await prisma.user.count();
            const conversionRate = totalUsers > 0 ? (totalPurchases / totalUsers) * 100 : 0;

            return {
                ...plan,
                analytics: {
                    activeSubscriptions,
                    totalPurchases,
                    revenueGenerated,
                    newSubscriptions30d,
                    churnedSubscriptions30d,
                    conversionRate: parseFloat(conversionRate.toFixed(2))
                }
            };
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError(status.INTERNAL_SERVER_ERROR, "Failed to fetch subscription plan", String(error));
        }
    }

    /**
     * Update subscription plan
     */
    async updatePlan(id: string, data: Partial<CreateSubscriptionPlanRequest>) {
        try {
            // Check if plan exists
            const existingPlan = await prisma.subscriptionPlan.findUnique({
                where: { id }
            });

            if (!existingPlan) {
                throw new ApiError(status.NOT_FOUND, "Subscription plan not found");
            }

            const updatedPlan = await prisma.subscriptionPlan.update({
                where: { id },
                data: {
                    price: data.price,
                    storageLimit: data.storageLimit,
                    features: data.features,
                    // Typically we don't allow updating 'type' or 'adminId' lightly
                }
            });
            return updatedPlan;
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError(status.INTERNAL_SERVER_ERROR, "Failed to update subscription plan", String(error));
        }
    }

    /**
     * Delete subscription plan
     */
    async deletePlan(id: string) {
        try {
            // Check if plan exists
            const existingPlan = await prisma.subscriptionPlan.findUnique({
                where: { id }
            });

            if (!existingPlan) {
                throw new ApiError(status.NOT_FOUND, "Subscription plan not found");
            }

            await prisma.subscriptionPlan.delete({
                where: { id }
            });
            return true;
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError(status.INTERNAL_SERVER_ERROR, "Failed to delete subscription plan", String(error));
        }
    }
}

export default new SubscriptionPlanService();
