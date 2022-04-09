import {DefaultController} from "./default.controller";
import express, {Request, Response, Router} from "express";
import {RestaurantService} from "../services";

export class RestaurantController extends DefaultController {
    buildRoutes (): Router {
        const router = express.Router()
        router.put('/add', express.json(), this.createRestaurant)
        return router
    }

    async createRestaurant (req: Request, res: Response) {
        await super.sendResponse(req, res, async () => {
            return await RestaurantService.getInstance().createRestaurant({
                name: req.body.name,
                address: req.body.address
            })
        })
    }
}