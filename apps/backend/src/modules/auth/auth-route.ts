import { Router } from "express";
import { createNewUser, getAdminProfile, getMe, loginAsAdmin, logout, refreshTokens } from "./auth-controller";
import userAuthMiddleware from "@/middlewares/user-auth-middleware";
import adminAuthMiddleware from "@/middlewares/admin-auth-middleware";

const router = Router()

router.post('/create-user', createNewUser)
router.get('/me', userAuthMiddleware, getMe)



// admin routes
router.post('/login-admin', loginAsAdmin)
router.post('/refresh-tokens', refreshTokens)
router.post('/logout', logout)
router.get('/get-admin-profile', adminAuthMiddleware, getAdminProfile)

export const authRouter = router