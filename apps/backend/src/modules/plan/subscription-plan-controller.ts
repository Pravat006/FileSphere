import { asyncHandler } from "@/utils/async-handler";
import { ApiResponse } from "@/interface";
import status from "http-status";
import subscriptionPlanService from "./subscription-plan-service";
import { CreateSubscriptionPlanRequest, UpdateSubscriptionPlanRequest } from "@repo/shared";
import { serializeBigInt } from "@/utils/serialize-bigint";
import { ApiError } from "@/interface";





/**
 * Create a new subscription plan
 */
export const createSubscriptionPlanController = asyncHandler(async (req, res) => {
    const adminId = req.admin?.id;
    if (!adminId) {
        throw new ApiError(status.UNAUTHORIZED, "Admin not authenticated");
    }
    223
    const body = req.body as CreateSubscriptionPlanRequest;

    const plan = await subscriptionPlanService.createPlan(body, adminId);

    // Serialize BigInt before sending response
    const data = serializeBigInt(plan);

    return res.status(status.CREATED).json(
        new ApiResponse(status.CREATED, "Subscription plan created successfully", data)
    );
});

/**
 * Get all subscription plans
 */
export const getSubscriptionPlansController = asyncHandler(async (req, res) => {
    const plans = await subscriptionPlanService.getPlans();

    // Serialize BigInt before sending response
    const data = serializeBigInt(plans);

    return res.status(status.OK).json(
        new ApiResponse(status.OK, "Subscription plans fetched successfully", data)
    );
});

/**
 * Update subscription plan
 */
export const updateSubscriptionPlanController = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const body = req.body as UpdateSubscriptionPlanRequest;

    const plan = await subscriptionPlanService.updatePlan(id, body);

    // Serialize BigInt before sending response
    const data = serializeBigInt(plan);

    return res.status(status.OK).json(
        new ApiResponse(status.OK, "Subscription plan updated successfully", data)
    );
});

/**
 * danger zone
 * Delete subscription plan
 */
export const deleteSubscriptionPlanController = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await subscriptionPlanService.deletePlan(id);

    return res.status(status.OK).json(
        new ApiResponse(status.OK, "Subscription plan deleted successfully")
    );
});



/**
 * get subscription details by id
 * probably stats for admin
 */

export const getScriptionPlanStats = asyncHandler(
    async (req, res) => {
        const { planId } = req.body;

        const data = await subscriptionPlanService.getPlanById(planId)

        return res.status(status.OK).json(
            new ApiResponse(status.OK, "subscription plan stats retrived successfully", data)
        )
    }
)
