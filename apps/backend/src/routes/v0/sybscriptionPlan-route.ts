import { createSubscriptionPlan, getSubscriptionPlans, deleteSubscriptionPlan, updateSubscriptionPlan } from "@/controllers/subscriptionPlan-contoller"
import adminMiddleware from "@/middlewares/admin-middleware"
import verifyToken from "@/middlewares/auth-middleware"
import { Router } from "express"

const router = Router()
// router.use(verifyToken)

router.post('/subscriptionPlan', verifyToken, adminMiddleware, createSubscriptionPlan)
router.get('/subscriptionPlan', verifyToken, getSubscriptionPlans)
router.delete('/subscriptionPlan/:id', verifyToken, adminMiddleware, deleteSubscriptionPlan)
router.put('/subscriptionPlan/:id', verifyToken, adminMiddleware, updateSubscriptionPlan)

export default router