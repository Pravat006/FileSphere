import { Router } from 'express';
import userAuthMiddleware from '@/middlewares/user-auth-middleware';
import {
    createRazorpayOrder,
    verifyRazorpayPayment,
    getUserActiveSubscription,
    getUserSubscriptionHistory,
} from './subscription-controller';

const router = Router();

router.use(userAuthMiddleware);

router.post('/create-razorpay-order/:planId', createRazorpayOrder);
router.post('/verify-razorpay-payment/:orderId/:paymentId/:signature', verifyRazorpayPayment);
router.get('/user-active-subscription', getUserActiveSubscription);
router.get('/user-subscription-history', getUserSubscriptionHistory);

export const subscriptionRouter = router;


