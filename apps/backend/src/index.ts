import app from "@/app";
import * as process from "node:process";
import dotenv from "dotenv";
import { logger } from "./config/logger";

dotenv.config({ path: "./.env" });

app.listen(process.env.PORT || 3000, () => {
    logger.info(`Server is running on http://localhost:${process.env.PORT || 3000}`);
});