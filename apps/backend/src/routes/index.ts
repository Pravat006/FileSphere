import { authRouter } from "@/modules/auth/auth-route";
import { Router } from "express";
import { uploadRouter } from "@/modules/upload/upload-routes"
import { fileRouter } from "@/modules/file/file-route";
import { folderRouter } from "@/modules/folder/folder-route";
import { subscriptionPlanRouter } from "@/modules/plan/subscription-plan-routes";
import { subscriptionRouter } from "@/modules/subscription/subscription-routes";
import { webhookRouter } from "@/modules/webhook/webhook-routes";
import { userSafeRouter } from "@/modules/user/user-route";

const router = Router()

type Route = {
    path: string,
    route: Router
}

const routeModules: Route[] = [
    {
        path: '/auth',
        route: authRouter
    },
    {
        path: '/upload',
        route: uploadRouter
    },
    {
        path: '/file',
        route: fileRouter
    },
    {
        path: '/folder',
        route: folderRouter
    },
    {
        path: '/plan',
        route: subscriptionPlanRouter
    },
    {
        path: '/subscription',
        route: subscriptionRouter
    },
    {
        path: '/webhook',
        route: webhookRouter
    },
    {
        path: '/user',
        route: userSafeRouter
    }
]

routeModules.forEach((route) => {
    router.use(route.path, route.route)
})

export default router
