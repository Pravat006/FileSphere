import z from "zod";

// Admin uses email/password auth (not Firebase)
export const createAdminSchema = z.object({
    email: z.string().email("Invalid email address provided"),
    name: z.string().min(1, "Name is required"),
    password: z.string().min(8, "Password must be at least 8 characters")
});

export const updateAdminSchema = z.object({
    name: z.string().min(1).optional(),
    password: z.string().min(8).optional()
});

export const adminLoginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required")
});

export const adminSchema = z.object({
    id: z.string().cuid(),
    email: z.string().email(),
    name: z.string().min(1),
    createdAt: z.date(),
    updatedAt: z.date()
    // Note: password is excluded for security
})

// User uses Firebase authentication
export const createUserSchema = z.object({
    firebaseUid: z.string().min(1, "Firebase UID is required"),
    email: z.string().email("Invalid email address provided"),
    name: z.string().min(1, "Name is required").optional(),
    planId: z.string().cuid().optional()
})

export const userSchema = z.object({
    id: z.string().cuid(),
    firebaseUid: z.string(),
    email: z.string().email(),
    name: z.string().nullable(),
    planId: z.string().cuid().nullable(),
    storageUsed: z.bigint().default(BigInt(0)),
    createdAt: z.date(),
    updatedAt: z.date()
})

export type CreateAdminSchema = z.infer<typeof createAdminSchema>;
export type UpdateAdminSchema = z.infer<typeof updateAdminSchema>;
export type AdminLoginSchema = z.infer<typeof adminLoginSchema>;
export type Admin = z.infer<typeof adminSchema>;
export type CreateUserSchema = z.infer<typeof createUserSchema>;
export type User = z.infer<typeof userSchema>;