import { Router } from "express";
import v0Routes from "./v0";

const router = Router();

router.get("/health-check", (req, res) => {
    console.log("Health check endpoint hit");
    res.status(200).json({
        status: "true",
        message: "Server is healthy",
        timestamp: new Date().toISOString()
    });
});

router.use("/v0", v0Routes);

export default router;