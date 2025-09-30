import morgan from "morgan";
import { logger } from "@/config/winston.logger";
import { Request, Response } from "express";

// Custom token for response time with colors
morgan.token('response-time-colored', (req: Request, res: Response) => {
    const responseTime = parseFloat((morgan as any)['response-time'](req, res) || '0');
    if (responseTime > 1000) return `🔴 ${responseTime}ms`;
    if (responseTime > 500) return `🟡 ${responseTime}ms`;
    return `🟢 ${responseTime}ms`;
});

// Custom token for status with colors
morgan.token('status-colored', (req: Request, res: Response) => {
    const status = res.statusCode;
    if (status >= 500) return `🔴 ${status}`;
    if (status >= 400) return `🟡 ${status}`;
    if (status >= 300) return `🔵 ${status}`;
    return `🟢 ${status}`;
});

// Custom token for method with colors
morgan.token('method-colored', (req: Request) => {
    const method = req.method;
    const colors: { [key: string]: string } = {
        'GET': '🟢',
        'POST': '🟡',
        'PUT': '🔵',
        'DELETE': '🔴',
        'PATCH': '🟠'
    };
    return `${colors[method] || '⚪'} ${method}`;
});

// Development format with colors
const developmentFormat = ':method-colored :url :status-colored :response-time-colored - :res[content-length] - :remote-addr';

// Production format (more detailed)
const productionFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms';

// Stream for Winston
const stream = {
    write: (message: string) => {
        // Remove trailing newline
        logger.http(message.trim());
    }
};

// Export configured morgan middleware
export const morganMiddleware = morgan(
    process.env.NODE_ENV === 'production' ? productionFormat : developmentFormat,
    {
        stream,
        // Skip logging for certain conditions
        skip: (req: Request, res: Response) => {
            // Skip health checks and static files in production
            if (process.env.NODE_ENV === 'production') {
                return req.url === '/health' || req.url.startsWith('/static');
            }
            return false;
        }
    }
);

// Additional middleware for error logging
export const morganErrorMiddleware = morgan(productionFormat, {
    stream,
    skip: (req: Request, res: Response) => res.statusCode < 400
});