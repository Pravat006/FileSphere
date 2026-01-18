import app from "@/app";
import * as process from "node:process";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT || 3000}`);
});