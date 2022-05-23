import express, {Request, Response, Router} from "express";
import {AuthService} from "../services";
import {DefaultController} from "./default.controller";
import {getAuthorization} from "../utils";

export class AuthController extends DefaultController {
    buildRoutes (): Router {
        const router = express.Router()
        router.post('/subscribe', express.json(), this.createUser)
        router.post('/login', express.json(), this.logUser)
        return router
    }
    /**
     * Method : POST
     * URL : /auth/subscribe
     * Permissions required : none, except for creating an admin, where BigBoss role is required
     *
     * @param req HTTP request object with JSON object
     * {
     *     "login": "{{login}}",
     *     "password": "{{password}}",
     *     "role": "{{role}}"
     * }
     * @param res HTTP response object
     *
     * @returns UserDocument or 201 error
     */
    async createUser (req: Request, res: Response) {
        await super.sendResponse(req, res, async () => {
            const authToken = getAuthorization(req)
            return await AuthService.getInstance().subscribe({
                login: req.body.login,
                password: req.body.password,
                role: req.body.role !== null ? req.body.role : null
            }, authToken)
        }, 201)
    }

    /**
     * Method : POST
     * URL : /auth/auth
     * Permissions required : none
     *
     * @param req HTTP request object with JSON object
     * {
     *     "login": "{{login}}",
     *     "password": "{{password}}"
     * }
     * @param res HTTP response object
     *
     * @returns UserDocument or 201 error
     */
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