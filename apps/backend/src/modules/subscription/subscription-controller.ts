import { asyncHandler } from "@/utils/async-handler";
import { ApiResponse } from "@/interface";
import status from "http-status";
import subscriptionService from "./subscription-service";
import config from "@/config";


/**
 * create razorpay order
 * POST /api/v0/subscription/create-razorpay-order
 * @param req
 * @param res
 * @returns 
 */
export const createRazorpayOrder = asyncHandler(async (req, res) => {
    const { planId } = req.params as { planId: string }
    ``
    const userId = req.user?.id as string
    const result = await subscriptionService.createRazorpayOrder(userId, planId)



    res.status(status.CREATED).json(
        new ApiResponse(status.OK, "Razorpay order created successfully", {
            ...result,
            key: config.RAZORPAY_KEY_ID
        })
    )
})

/**
 *  verify razorpay payment
 * POST /api/v0/subscription/verify-razorpay-payment
 * @param req
 * @param res
 * @returns 
 */
export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
    const { paymentId, orderId, signature } = req.params as { paymentId: string, orderId: string, signature: string }
    const userId = req.user?.id as string
    const result = await subscriptionService.verifyRazorpayPayment(userId, paymentId, orderId, signature)
    res.status(status.OK).json(
        new ApiResponse(status.OK, "Razorpay payment verified successfully", result)
    )
})

/**
 * get user's active subscription
 * GET /api/v0/subscription/user-active-subscription
 * @param req
 * @param res
 * @returns 
 */
export const getUserActiveSubscription = asyncHandler(async (req, res) => {
    const userId = req.user?.id as string
    const result = await subscriptionService.getUserActiveSubscription(userId)
    res.status(status.OK).json(
        new ApiResponse(status.OK, "User active subscription fetched successfully", result)
    )
})

/**
 *  get user subscription history
 * GET /api/v0/subscription/user-subscription-history
 * @param req
 * @param res
 * @returns 
 */
export const getUserSubscriptionHistory = asyncHandler(async (req, res) => {
    const userId = req.user?.id as string
    const result = await subscriptionService.getSubscriptionHistory(userId)
    res.status(status.OK).json(
        new ApiResponse(status.OK, "User subscription history fetched successfully", result)
    )
})







