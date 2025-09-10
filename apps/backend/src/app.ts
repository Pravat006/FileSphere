import express from 'express';
import cors from 'cors';
import morgan from "morgan"
import router from './routes';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true
}));
app.use(express.json());
app.use(morgan("dev"))
app.use(express.urlencoded({ extended: true }));

app.use(router);

export default app