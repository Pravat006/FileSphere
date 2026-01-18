import { authRouter } from "@/modules/auth/auth-route";
import { Router } from "express";

const router = Router()


type Route = {
    path: string,
    route: Router
}

const routeModules: Route[] = [

    {
        path: '/auth',
        route: authRouter
    }

]

routeModules.forEach((route) => {
    router.use(route.path, route.route)
})

export default router
