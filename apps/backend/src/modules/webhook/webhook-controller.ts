import { Request, Response } from "express";
import { verifyWebhookSignature } from "@/config/razorpay-config";
import subscriptionService from "../subscription/subscription-service";
import { logger } from "@/config/logger";
import status from "http-status";
import { ApiError } from "@/interface";

/**
 * Handle Razorpay webhook events
 * POST /api/v0/webhook/razorpay
 * @param req 
 * @param res 
 */
export const handleRazorpayWebhook = async (req: Request, res: Response) => {
    try {
        // Get the signature from headers
        const webhookSignature = req.headers['x-razorpay-signature'] as string;

        if (!webhookSignature) {
            logger.error('[WEBHOOK] Missing webhook signature');
            return res.status(status.BAD_REQUEST).json({
                error: 'Missing signature'
            });
        }

        // Verify the webhook signature
        const isValid = verifyWebhookSignature(req.body, webhookSignature);

        if (!isValid) {
            logger.error('[WEBHOOK] Invalid webhook signature');
            return res.status(status.UNAUTHORIZED).json({
                error: 'Invalid signature'
            });
        }

        // Extract event and payload
        const event = req.body.event;
        const payload = req.body.payload;

        logger.info(`[WEBHOOK] Received event: ${event}`);

        // Process the event based on type
        switch (event) {
            case 'payment.authorized':
            case 'payment.captured':
                await handlePaymentSuccess(payload);
                break;

            case 'payment.failed':
                await handlePaymentFailure(payload);
                break;

            case 'order.paid':
                await handleOrderPaid(payload);
                break;

            case 'refund.created':
            case 'refund.processed':
                await handleRefund(payload);
                break;

            default:
                logger.warn(`[WEBHOOK] Unhandled event type: ${event}`);
        }

        // Always acknowledge receipt to Razorpay
        res.status(status.OK).json({ status: 'ok' });

    } catch (error) {
        logger.error('[WEBHOOK] Error processing webhook:', error);
        // Still return 200 to prevent Razorpay from retrying
        res.status(status.OK).json({ status: 'error', message: 'Internal error' });
    }
};

/**
 * Handle successful payment events
 */
async function handlePaymentSuccess(payload: any) {
    try {
        const payment = payload.payment.entity;
        const orderId = payment.order_id;
        const paymentId = payment.id;

        logger.info(`[WEBHOOK] Processing payment success for order: ${orderId}`);

        // Find the transaction by order ID
        const transaction = await subscriptionService.findTransactionByOrderId(orderId);

        if (!transaction) {
            logger.warn(`[WEBHOOK] Transaction not found for order: ${orderId}`);
            return;
        }

        // Check if already processed
        if (transaction.status === 'SUCCESS') {
            logger.info(`[WEBHOOK] Payment already processed for order: ${orderId}`);
            return;
        }

        // Activate subscription (this will update transaction and create subscription)
        logger.info(`[WEBHOOK] Activating subscription for user: ${transaction.ownerId}`);

        await subscriptionService.activateSubscriptionFromWebhook(orderId, paymentId);

    } catch (error) {
        logger.error('[WEBHOOK] Error handling payment success:', error);
        throw error;
    }
}

/**
 * Handle failed payment events
 */
async function handlePaymentFailure(payload: any) {
    try {
        const payment = payload.payment.entity;
        const orderId = payment.order_id;
        const errorCode = payment.error_code;
        const errorDescription = payment.error_description;

        logger.info(`[WEBHOOK] Processing payment failure for order: ${orderId}`);
        logger.info(`[WEBHOOK] Error: ${errorCode} - ${errorDescription}`);

        // Update transaction status to FAILED
        await subscriptionService.markTransactionAsFailed(orderId, errorCode, errorDescription);

    } catch (error) {
        logger.error('[WEBHOOK] Error handling payment failure:', error);
        throw new ApiError(status.BAD_REQUEST, "Error handling payment failure")
    }
}

/**
 * Handle order paid events
 */
async function handleOrderPaid(payload: any) {
    try {
        const order = payload.order.entity;

        logger.info(`[WEBHOOK] Order paid: ${order.id}`);

        // When order is paid, we can treat it as a successful payment if we have the payment details
        // Re-using the logic from handlePaymentSuccess by passing the payload
        // Razorpay often sends both payment.captured and order.paid
        await handlePaymentSuccess(payload);

    } catch (error) {
        logger.error('[WEBHOOK] Error handling order paid:', error);
        throw error;
    }
}

/**
 * Handle refund events
 */
async function handleRefund(payload: any) {
    try {
        const refund = payload.refund.entity;
        const paymentId = refund.payment_id;
        const refundAmount = refund.amount;

        logger.info(`[WEBHOOK] Processing refund for payment: ${paymentId}, Amount: ${refundAmount}`);

        // Handle refund logic
        // - Find the subscription by payment ID
        // - Cancel the subscription
        // - Update user's plan back to free tier
        // - Adjust storage limits
        // TODO: Implement this in subscription service first

    } catch (error) {
        logger.error('[WEBHOOK] Error handling refund:', error);
        throw error;
    }
}
