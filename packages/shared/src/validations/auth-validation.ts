import z from "zod";

export const createAdminSchema = z.object({
    uid: z.string().min(1, "Firebase UID is required"),
    email: z.string().email("Invalid email address"),
    name: z.string().min(1, "Name is required").optional()
});

export type CreateAdminSchema = z.infer<typeof createAdminSchema>;