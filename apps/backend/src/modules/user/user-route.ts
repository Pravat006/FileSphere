import { Router } from "express";
import { deleteAccount, getUserStats, updateProfile } from "./user-controller";
import userAuthMiddleware from "@/middlewares/user-auth-middleware";

const router = Router();

// All user routes require authentication
router.use(userAuthMiddleware);

router.get("/stats", getUserStats);
router.patch("/profile", updateProfile);
router.delete("/account", deleteAccount);

export const userSafeRouter = router;
