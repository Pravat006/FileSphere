import { ApiError } from "@/interface";
import { allowedMimeTypes } from "@repo/shared";
import { NextFunction, Request, Response } from "express";
import status from "http-status";

export const validateMimeTypeAndSize = (req: Request, res: Response, next: NextFunction) => {
    const { mimeType, fileSize } = req.body;

    if (!allowedMimeTypes.includes(mimeType)) {
        throw new ApiError(status.BAD_REQUEST, "Unsupported file type", "FILE_VALIDATION_MIDDLEWARE");
    }
    // maximum file size is 1gb
    const maxSize = 1024 * 1024 * 1024;
    if (fileSize > maxSize) {
        throw new ApiError(status.BAD_REQUEST, "File size exceeds the maximum limit", "FILE_VALIDATION_MIDDLEWARE");
    }


    next();
};
