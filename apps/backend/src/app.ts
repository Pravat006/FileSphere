import express from 'express';
import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { logger } from '@/config/winston.logger';
import router from './routes';
import { morganMiddleware, morganErrorMiddleware } from '@/middlewares/morgan-middleware';
import path from 'path';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true
}));
app.use(express.json());
app.use(morganMiddleware);
app.use(morganErrorMiddleware);
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

app.use(router);

export default app