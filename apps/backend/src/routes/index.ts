import { authRouter } from "@/modules/auth/auth-route";
import { Router } from "express";
import { uploadRouter } from "@/modules/upload/upload-routes"
import { fileRouter } from "@/modules/file/file-route";

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
    }
]

routeModules.forEach((route) => {
    router.use(route.path, route.route)
})

export default router
