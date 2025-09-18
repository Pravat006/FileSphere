import { createAdminUser, createNewUser } from "@/controllers/auth-controller";
import { Router } from "express";

const router = Router();

router.post('/user/create', createNewUser);
router.post('/user/create-admin', createAdminUser);

export default router;