import { createSubscriptionPlan, getSubscriptionPlans, deleteSubscriptionPlan, updateSubscriptionPlan } from "@/controllers/subscriptionPlan-contoller"
import adminMiddleware from "@/middlewares/admin-middleware"
import verifyToken from "@/middlewares/auth-middleware"
import { Router } from "express"

const router = Router()
router.use(verifyToken)

router.post('/subscriptionPlan', adminMiddleware, createSubscriptionPlan)
router.get('/subscriptionPlan', getSubscriptionPlans)
router.delete('/subscriptionPlan/:id', adminMiddleware, deleteSubscriptionPlan)
router.put('/subscriptionPlan/:id', adminMiddleware, updateSubscriptionPlan)

export default router