import { Router } from "express";
import { createNewUser, getAdminProfile, loginAsAdmin, logout, refreshTokens } from "./auth-controller";

const router = Router()

router.post('/create-user', createNewUser)



// admin routes
router.post('/login-admin', loginAsAdmin)
router.post('/refresh-tokens', refreshTokens)
router.post('/logout', logout)
router.get('/get-admin-profile', getAdminProfile)

export const authRouter = router