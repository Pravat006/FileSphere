import winston from "winston";
import { format, transports } from "winston";
import path from "path";
import fs from "fs";

const { combine, timestamp, printf, colorize, errors, json, prettyPrint } = format;

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for console output
const consoleFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    const stackStr = stack ? `\n${stack}` : '';
    return `[${timestamp}] ${level}: ${message}${stackStr}${metaStr ? `\n${metaStr}` : ''}`;
});

// Custom format for file output
const fileFormat = combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    json()
);

// Create different log levels
const logger = winston.createLogger({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        errors({ stack: true })
    ),
    transports: [
        // Console transport with colors
        new transports.Console({
            format: combine(
                colorize({ all: true }),
                consoleFormat
            )
        }),

        // Combined logs (all levels)
        new transports.File({
            filename: path.join(logsDir, "combined.log"),
            format: fileFormat,
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),

        // Error logs only
        new transports.File({
            filename: path.join(logsDir, "error.log"),
            level: "error",
            format: fileFormat,
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),

        // HTTP logs for requests
        new transports.File({
            filename: path.join(logsDir, "http.log"),
            level: "http",
            format: fileFormat,
            maxsize: 5242880, // 5MB
            maxFiles: 3,
        }),
    ],
    // Handle uncaught exceptions
    exceptionHandlers: [
        new transports.File({
            filename: path.join(logsDir, "exceptions.log"),
            format: fileFormat
        })
    ],
    // Handle unhandled promise rejections
    rejectionHandlers: [
        new transports.File({
            filename: path.join(logsDir, "rejections.log"),
            format: fileFormat
        })
    ]
});

// Add custom log levels
logger.add(new winston.transports.Console({
    level: 'http',
    silent: process.env.NODE_ENV === 'test'
}));

export { logger };