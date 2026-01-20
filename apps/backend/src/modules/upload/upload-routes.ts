import { Router } from "express";
import { abortUploadController, completeMultiPartUpload, initiateUploadController } from "./upload-controller";

import { uploadQuotaMiddleware, validateRequest, validateMimeTypeAndSize } from "@/middlewares";
import { abortUploadSchema, completeUploadSchema, initiateUploadSchema } from "@repo/shared";
import userAuthMiddleware from "@/middlewares/user-auth-middleware";

const router = Router()
router.use(userAuthMiddleware)

router.post('/initiate-upload', validateRequest(initiateUploadSchema), validateMimeTypeAndSize, uploadQuotaMiddleware, initiateUploadController)
router.post('/complete-upload', validateRequest(completeUploadSchema), completeMultiPartUpload)
router.post('/abort-upload', validateRequest(abortUploadSchema), abortUploadController)

export const uploadRouter = router
