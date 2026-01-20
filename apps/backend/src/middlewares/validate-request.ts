import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";
import status from "http-status";

export const validateRequest = (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
    try {
        schema.parse(req.body);
        next();
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(status.BAD_REQUEST).json({
                success: false,
                message: "Validation Error",
                errors: error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message
                }))
            });
        }
        next(error);
    }
};
