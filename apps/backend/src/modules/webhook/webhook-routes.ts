import { Router } from 'express';
import { handleRazorpayWebhook } from './webhook-controller';

const router = Router();


router.post('/razorpay', handleRazorpayWebhook);

export const webhookRouter = router;
