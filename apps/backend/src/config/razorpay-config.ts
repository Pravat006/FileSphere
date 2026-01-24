import Razorpay from 'razorpay'
import config from "@/config"
import crypto from "crypto"

export const razorpayInstance = new Razorpay({
    key_id: config.RAZORPAY_KEY_ID,
    key_secret: config.RAZORPAY_KEY_SECRET
})

export const verifyPaymentSignature = (
    orderId: string,
    paymenId: string,
    signature: string
): boolean => {

    const expectedSignature = crypto.createHmac('sha256', config.RAZORPAY_KEY_SECRET).update(orderId + '|' + paymenId)
        .digest('hex')


    return expectedSignature === signature

}

export const createRazorpayOrder = async (amount: number, currency: string, userId: string) => {
    const order = await razorpayInstance.orders.create({
        amount: amount * 100,
        currency,
        receipt: `receipt_${userId}_${Date.now()}`,
    })
    return order
}

export const verifyRazorpayPayment = async (paymentId: string, orderId: string, signature: string) => {
    const verified = verifyPaymentSignature(orderId, paymentId, signature)
    return verified
}

/**
 * Verify Razorpay webhook signature
 * @param webhookBody - The raw webhook request body (as string or object)
 * @param webhookSignature - The signature from x-razorpay-signature header
 * @returns boolean - true if signature is valid
 */
export const verifyWebhookSignature = (
    webhookBody: string | object,
    webhookSignature: string
): boolean => {
    try {
        // Convert body to string if it's an object
        const body = typeof webhookBody === 'string'
            ? webhookBody
            : JSON.stringify(webhookBody)

        // Generate expected signature using webhook secret
        const expectedSignature = crypto
            .createHmac('sha256', config.RAZORPAY_WEBHOOK_SECRET)
            .update(body)
            .digest('hex')

        return expectedSignature === webhookSignature
    } catch (error) {
        console.error('Error verifying webhook signature:', error)
        return false
    }
}



