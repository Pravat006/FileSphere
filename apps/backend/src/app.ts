import express from 'express';
import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { logger, httpLogger } from '@/config/logger';
import router from './routes';
import path from 'path';
import { errorHandler, apiLimiter, notFound } from '@/middlewares';

const app = express();

httpLogger(app);

app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true
}));
app.use(express.json());

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    logger.error('Unhandled error:', {
        error: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        ip: req.ip
    });

    res.status(500).json({
        message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
    });
});
app.use('/static', express.static(path.join(process.cwd(), 'public')));

app.use(express.urlencoded({ extended: true }));

app.use("/api/v0", apiLimiter, router);

app.use(notFound)
app.use(errorHandler)

export default app