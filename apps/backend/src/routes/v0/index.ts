import { Router } from "express";
import userRoute from "./user-route";
import SubscriptionPlanRoutes from "./sybscriptionPlan-route"
import fileRoute from "./file-route";
import folderRoute from "./folder-route";
const v0Routes = Router()

v0Routes.use(userRoute);
v0Routes.use(SubscriptionPlanRoutes);
v0Routes.use(fileRoute);
v0Routes.use(folderRoute);

export default v0Routes;
