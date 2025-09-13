import getAuthToken from '@/helper/get-auth-token';
import prisma from '@repo/db';
// import { User } from '@repo/shared';
import { RequestHandler } from 'express';

const createNewUser: RequestHandler = async (req, res) => {
    try {

        const decodedToken = await getAuthToken(req);
        const { uid, email, name } = decodedToken;

        // check the user 

        let user = await prisma.user.findUnique({
            where: {
                firebaseUid: uid,
            }
        });

        if (!user) {
            // Create new user if not found
            user = await prisma.user.create({
                data: {
                    firebaseUid: uid,
                    email: email || null,
                    displayName: name || null,
                    role: 'USER',
                    folders: {
                        create: {
                            name: 'My Drive',
                        }
                    }
                }
            });

            return res.status(201).json({
                message: 'User created successfully',
                user
            });
        }

        // User already exists
        return res.status(200).json({
            message: 'User already exists',
            user
        });

    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({
            message: 'Error adding user to database',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
};

export {
    createNewUser
};





