import { ApiError } from "@/utils/api-error";
import type { Request, Response, NextFunction, ErrorRequestHandler } from "express";

export const errorConverter: ErrorRequestHandler = (err, _req: Request, _res: Response, next) => {
    let error = err;
    if (!(error instanceof ApiError)) {
        const statusCode = 400;
        const message = error.message || statusCode;
        error = new ApiError(statusCode, message);
    }
    next(error);
};

export const errorHandler: ErrorRequestHandler = (err: ApiError, _req: Request, res: Response, _next: NextFunction) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || statusCode;
    const response = {
        code: statusCode,
        message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    };
    if (process.env.NODE_ENV === "development") {
        console.error(err);
    }
    res.status(statusCode).send(response);
};





