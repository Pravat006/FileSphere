import { RequestHandler } from "express";

const adminMiddleware: RequestHandler = async (req, res, next) => {
    try {
        const user = req.user;
        console.log('User in admin middleware:', user);
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if (user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'You are not authorized to access private endpoints' });
        }
        next();
    } catch (error) {
        throw new Error('Error in admin middleware');
    }
}
export default adminMiddleware;