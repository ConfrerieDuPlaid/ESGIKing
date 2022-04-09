import express, {Request, Response, Router} from "express";
import {AuthService} from "../services";
import {DefaultController} from "./default.controller";

export class AuthController extends DefaultController {
    buildRoutes (): Router {
        const router = express.Router()
        router.post('/subscribe', express.json(), this.createUser)
        router.post('/login', express.json(), this.logUser)
        return router
    }

    async createUser (req: Request, res: Response) {
        await super.sendResponse(req, res, async () => {
            let authBasic = req.headers.authorization
            let authToken = null
            if (typeof authBasic === "string") {
                const authStr = authBasic.split(" ")
                authToken = authStr[1]
            }
            return await AuthService.getInstance().subscribe({
                login: req.body.login,
                password: req.body.password,
                role: req.body.role !== null ? req.body.role : null
            }, authToken)
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

}