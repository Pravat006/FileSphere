import getAuthToken from '@/helper/get-auth-token';
import prisma from '@repo/db';
import { RequestHandler } from 'express';
import { serializeBigInt } from '@/utils/serialize-bigint';
import { Prisma } from 'node_modules/@repo/db/generated/prisma';
import { createAdminSchema } from '@repo/shared';

const createNewUser: RequestHandler = async (req, res) => {
    try {
        const decodedToken = await getAuthToken(req);
        const { uid, email, name } = decodedToken;

        if (!uid) {
            return res.status(400).json({
                message: 'Firebase UID is required'
            });
        }

        // Check if user already exists
        let user = await prisma.user.findUnique({
            where: { firebaseUid: uid },
        });

        if (user) {
            return res.status(200).json({
                message: 'User already exists',
                user: serializeBigInt(user)
            });
        }

        // Fetch the 'FREE' subscription plan
        const freePlan = await prisma.subscriptionPlan.findFirst({
            where: { type: 'FREE' }
        });

        if (!freePlan) {
            return res.status(500).json({
                message: 'Free plan not found. Please contact support.'
            });
        }


        const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            // Create new user with related data
            const newUser = await tx.user.create({
                data: {
                    firebaseUid: uid,
                    email: email || '',
                    name: name || null,
                    role: 'USER',
                    planId: freePlan.id,
                    // Create trash container with user
                    trash: {
                        create: {}
                    },
                    folders: {
                        create: {
                            name: 'My Drive',
                        }
                    },
                    subscriptions: {
                        create: {
                            planId: freePlan.id,
                            startDate: new Date(),
                        }
                    }
                },
                include: {
                    plan: true,
                    folders: true,
                    subscriptions: true,
                    trash: true
                }
            });

            return newUser;
        });

        return res.status(201).json({
            message: 'User created successfully',
            user: serializeBigInt(result)
        });

    } catch (error) {
        console.error('Error creating user:', error);

        if (error instanceof Error) {
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }

        // Check if it's a Prisma error
        if (error && typeof error === 'object' && 'code' in error) {
            console.error('Prisma error code:', (error as any).code);
            console.error('Prisma error meta:', (error as any).meta);
        }

        return res.status(500).json({
            message: 'Error adding user to database',
            error: process.env.NODE_ENV === 'development' ? {
                name: error instanceof Error ? error.name : 'Unknown',
                message: error instanceof Error ? error.message : String(error),
                code: error && typeof error === 'object' && 'code' in error ? (error as any).code : undefined,
                details: error instanceof Error ? error.stack : undefined
            } : { message: 'Internal server error' }
        });
    }
};

const createAdminUser: RequestHandler = async (req, res) => {
    try {
        const validationResult = createAdminSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                message: 'Invalid request data',
                errors: validationResult.error.errors
            });
        }

        const { uid, email, name } = validationResult.data;
        // LATER : implement zod validation
        // Validate required fields
        if (!uid) {
            return res.status(400).json({
                message: 'Firebase UID is required'
            });
        }

        if (!email) {
            return res.status(400).json({
                message: 'Email is required'
            });
        }

        // Check if admin roled user already exists
        const existingAdmin = await prisma.user.findUnique({
            where: { firebaseUid: uid }
        });

        if (existingAdmin) {
            return res.status(409).json({
                message: 'Admin user already exists',
                user: serializeBigInt(existingAdmin)
            });
        }

        // Create admin user (no plan, folders, or subscriptions needed)
        const adminUser = await prisma.user.create({
            data: {
                firebaseUid: uid,
                email: email,
                name: name || null,
                role: 'ADMIN',
            }
        });

        return res.status(201).json({
            message: 'Admin user created successfully',
            user: serializeBigInt(adminUser)
        });

    } catch (error) {

        if (error instanceof Error) {
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }

        return res.status(500).json({
            message: 'Error adding admin user to database',
            error: process.env.NODE_ENV === 'development' ? {
                name: error instanceof Error ? error.name : 'Unknown',
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            } : { message: 'Internal server error' }
        });
    }
};

export {
    createNewUser,
    createAdminUser
};





