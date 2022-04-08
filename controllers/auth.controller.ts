import express, {Request, Response, Router} from "express";
import {AuthService} from "../services";
import {DefaultController} from "./default.controller";

export class AuthController extends DefaultController {
    async createUser (req: Request, res: Response) {
        await super.sendResponse(req, res, async () => {
            return await AuthService.getInstance().subscribe({
                login: req.body.login,
                password: req.body.password
            })
        })
    }

    async logUser (req: Request, res: Response) {
        await super.sendResponse(req, res, async () => {
            const platform = req.headers["user-agent"] || "Unknown"
            return await AuthService.getInstance().login({
                login: req.body.login,
                password: req.body.password
            }, platform)
        })
    }

    buildRoutes (): Router {
        const router = express.Router()
        router.post('/subscribe', express.json(), this.createUser)
        router.post('/login', express.json(), this.logUser)
        return router
    }

}