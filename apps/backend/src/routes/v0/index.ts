import { Router } from "express";
import userRoute from "./user-route";
import SubscriptionPlanRoutes from "./sybscriptionPlan-route"

const v0Routes = Router()
v0Routes.use(userRoute);
v0Routes.use(SubscriptionPlanRoutes);

export default v0Routes


