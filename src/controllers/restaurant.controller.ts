import {DefaultController} from "./default.controller";
import express, {Request, Response, Router} from "express";
import {AuthService, RestaurantService} from "../services";
import {ErrorResponse, getAuthorization} from "../utils";

export class RestaurantController extends DefaultController {
    buildRoutes (): Router {
        const router = express.Router()
        router.put('/add', express.json(), this.createRestaurant)
        return router
    }

    async createRestaurant (req: Request, res: Response) {
        await super.sendResponse(req, res, async () => {
            const authToken = getAuthorization(req)
            if (!await AuthService.getInstance().isValidRoleAndSession(authToken, "BigBoss")) {
                throw new ErrorResponse("You don't have permissions !", 403)
            }

            return await RestaurantService.getInstance().createRestaurant({
                name: req.body.name,
                address: req.body.address
            })
        })
    }
}