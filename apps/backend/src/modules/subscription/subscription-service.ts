import { createRazorpayOrder, verifyPaymentSignature, } from "@/config/razorpay-config"
import { ApiError } from "@/interface"
import db from "@/services/db"
import { Prisma } from "@repo/db"
import status from "http-status"
import { logger } from "@/config/logger"
import { redis } from "@/services"


class SubscriptionService {

    /**
     * create razorpayorder
     * @param userId
     * @param planId
     * @returns 
     */
    async createRazorpayOrder(userId: string, planId: string) {
        // fetch the plan details
        const plan = await db.subscriptionPlan.findUnique({
            where: {
                id: planId
            }
        })

        if (!plan) {
            throw new ApiError(status.NOT_FOUND, "Plan not found")
        }
        // create razorpay order
        const order = await createRazorpayOrder(plan.price, "INR", userId)
        // create transaction record
        const transaction = await db.transaction.create({
            data: {
                ownerId: userId,
                amount: plan.price,
                razorpayOrderId: order.id,
                status: "PENDING",
                razorpayPaymentId: null,
                razorpaySignature: null,

            }
        })
        return {
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            transactionId: transaction.id,
        }
    }

    /**
     * verify razorpay payment and activate subscription
     * @param userId
     * @param paymentId
     * @param orderId
     * @param signature
     * @returns 
     */
    async verifyRazorpayPayment(userId: string, paymentId: string, orderId: string, signature: string) {

        // validate the signature
        try {
            const isValid = verifyPaymentSignature(orderId, paymentId, signature)
            if (!isValid) {
                throw new ApiError(status.BAD_REQUEST, "Invalid payment signature")
            }

            // find the transaction
            const transaction = await db.transaction.findUnique({
                where: {
                    razorpayOrderId: orderId
                }
            })

            if (!transaction) {
                throw new ApiError(status.NOT_FOUND, "Transaction not found")
            }

            if (transaction.ownerId !== userId) {
                throw new ApiError(status.FORBIDDEN, "Unauthorized")
            }

            // check if already processed
            if (transaction.status === "SUCCESS") {
                return { message: "Subscription already activated" }
            }

            // activate subscription
            const result = await this.activateSubscription(transaction.id, userId, paymentId, signature)

            return result
        } catch (error) {
            throw new ApiError(status.INTERNAL_SERVER_ERROR, "Failed to verify razorpay payment", "VERIFY_RAZORPAY_PAYMENT_SERVICE")
        }
    }

    private async activateSubscription(
        transactionId: string,
        userId: string,
        paymentId: string,
        signature: string | null
    ) {
        /**
         *  1.update transaction
         * 2. get plan from the transaction 
         * for now , we need to add planId to Transaction model
         * 3. check for active subscription
         * 4. calculate dates
         * 5.create subscription history
         * 6. update user's current plan ( if immediate)
         * 
         */
        try {
            return await db.$transaction(async (tx: Prisma.TransactionClient) => {

                // 1.update transaction
                const transaction = await tx.transaction.update({
                    where: {
                        id: transactionId
                    },
                    data: {
                        status: "SUCCESS",
                        razorpayPaymentId: paymentId,
                        razorpaySignature: signature,
                    }
                })
                // 2. get plan from the transaction 
                // for now , we need to add planId to Transaction model
                //  or fetch from the subscriptionHistory if exists
                const activeSubscription = await tx.subscriptionHistory.findFirst({
                    where: {
                        userId: userId,
                        endDate: {
                            gte: new Date()
                        }
                    },
                    orderBy: {
                        createdAt: "desc"
                    }
                })
                // calculate dates
                const startDate =
                    activeSubscription && activeSubscription.endDate && activeSubscription.endDate > new Date()
                        ? activeSubscription.endDate
                        : new Date()

                const plan = await tx.subscriptionPlan.findFirst({
                    where: {
                        price: transaction.amount,
                    }
                })
                if (!plan) {
                    throw new ApiError(status.NOT_FOUND, "Plan not found", "ACTIVATE_SUBSCRIPTION_SERVICE")
                }
                const endDate = new Date(startDate)
                endDate.setMonth(endDate.getMonth() + 1)

                // 5. create subscription history
                const subscriptionHistory = await tx.subscriptionHistory.create({
                    data: {
                        userId: userId,
                        planId: plan.id,
                        startDate: startDate,
                        endDate: endDate,
                        transactionId: transaction.id,
                    }
                })
                // 6. update user's current plan ( if immediate)
                if (!activeSubscription) {
                    const updatedUser = await tx.user.update({
                        where: {
                            id: userId
                        },
                        data: {
                            planId: plan.id,
                        }
                    })

                    // Invalidate cache
                    await redis.delete(`user:${updatedUser.firebaseUid}`);
                }

                return {
                    subscriptionHistory,
                    immediateActivation: !activeSubscription,
                }
            })
        } catch (error) {
            throw new ApiError(status.INTERNAL_SERVER_ERROR, "Failed to activate subscription", "ACTIVATE_SUBSCRIPTION_SERVICE")
        }
    }

    /**
     * get user's active subscriptio
     */
    async getUserActiveSubscription(userId: string) {
        try {
            return await db.subscriptionHistory.findFirst({
                where: {
                    userId: userId,
                    endDate: {
                        gte: new Date()
                    }
                },
                orderBy: {
                    createdAt: "desc"
                }
            })
        } catch (error) {
            throw new ApiError(status.INTERNAL_SERVER_ERROR, "Failed to get user active subscription", "GET_USER_ACTIVE_SUBSCRIPTION_SERVICE")
        }
    }

    /**
     * get subscription history
     */
    async getSubscriptionHistory(userId: string) {
        try {
            return await db.subscriptionHistory.findMany({
                where: {
                    userId: userId,
                },
                orderBy: {
                    createdAt: "desc"
                }
            })
        } catch (error) {
            throw new ApiError(status.INTERNAL_SERVER_ERROR, "Failed to get subscription history", "GET_SUBSCRIPTION_HISTORY_SERVICE")
        }
    }

    /**
     * Find transaction by Razorpay order ID
     * Used by webhook handlers to process payment events
     * @param orderId - Razorpay order ID
     * @returns Transaction record or null if not found
     */
    async findTransactionByOrderId(orderId: string) {
        try {
            return await db.transaction.findUnique({
                where: {
                    razorpayOrderId: orderId
                }
            })
        } catch (error) {
            throw new ApiError(status.INTERNAL_SERVER_ERROR, "Failed to find transaction by order ID", "FIND_TRANSACTION_BY_ORDER_ID_SERVICE")
        }
    }

    /**
     * Mark a transaction as failed
     * @param orderId 
     * @param errorCode 
     * @param errorDescription 
     */
    async markTransactionAsFailed(orderId: string, errorCode?: string, errorDescription?: string) {
        try {
            return await db.transaction.update({
                where: {
                    razorpayOrderId: orderId
                },
                data: {
                    status: "FAILED",
                }
            })
        } catch (error) {
            logger.error(`[SUBSCRIPTION_SERVICE] Error marking transaction as failed: ${orderId}`, error);
            throw new ApiError(status.INTERNAL_SERVER_ERROR, "Failed to mark transaction as failed")
        }
    }

    /**
     * Activate subscription from a webhook
     * Webhooks are already verified, so we don't need to check signature again
     * @param orderId 
     * @param paymentId 
     */
    async activateSubscriptionFromWebhook(orderId: string, paymentId: string) {
        const transaction = await this.findTransactionByOrderId(orderId);

        if (!transaction) {
            throw new ApiError(status.NOT_FOUND, "Transaction not found")
        }

        if (transaction.status === "SUCCESS") {
            return { message: "Already processed" }
        }

        return await this.activateSubscription(
            transaction.id,
            transaction.ownerId,
            paymentId,
            ""
        )
    }

}

export default new SubscriptionService()