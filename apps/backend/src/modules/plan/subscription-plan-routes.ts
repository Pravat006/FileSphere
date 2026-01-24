import { Router } from "express";
import adminMiddleware from "@/middlewares/admin-auth-middleware";
import {
    createSubscriptionPlanController,
    deleteSubscriptionPlanController,
    getSubscriptionPlansController,
    updateSubscriptionPlanController
} from "./subscription-plan-controller";
import { validateRequest } from "@/middlewares";
import { createSubscriptionPlanSchema, updateSubscriptionPlanSchema } from "@repo/shared";

const router = Router();

// Retrieve plans (Public or Protected? Usually public to see what's available, but let's keep it open for now or admin only if managing)
// If this is for the general user to see plans, we might need a separate public endpoint or relax the middleware for GET
// For now, these seem to be admin management endpoints.

// Apply admin auth middleware to all routes


router.post("/", adminMiddleware, validateRequest(createSubscriptionPlanSchema), createSubscriptionPlanController);
router.get("/", getSubscriptionPlansController);
router.patch("/:id", adminMiddleware, validateRequest(updateSubscriptionPlanSchema), updateSubscriptionPlanController);
router.delete("/:id", adminMiddleware, deleteSubscriptionPlanController);

export const subscriptionPlanRouter = router;
