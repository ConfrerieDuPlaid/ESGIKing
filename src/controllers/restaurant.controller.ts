import {DefaultController} from "./default.controller";
import express, {Request, Response, Router} from "express";
import {AuthService, RestaurantService} from "../services";
import {ErrorResponse, getAuthorization} from "../utils";
import {Roles} from "../utils/roles";

export class RestaurantController extends DefaultController {
    buildRoutes (): Router {
        const router = express.Router()
        router.put('/add', express.json(), this.createRestaurant.bind(this))
        router.get('/getOne', express.json(), this.getOneRestaurant.bind(this))
        return router
    }

    async createRestaurant (req: Request, res: Response) {
        await super.sendResponse(req, res, async () => {
            await this.verifyPermissions(req, Roles.BigBoss)

            return await RestaurantService.getInstance().createRestaurant({
                name: req.body.name,
                address: req.body.address
            })
        })
    }

    async getOneRestaurant (req: Request, res: Response) {
        await super.sendResponse(req, res, async () => {
            await this.verifyPermissions(req, Roles.BigBoss)
            return await RestaurantService.getInstance().getOneRestaurant(req.body.id)
        })
    }

    async verifyPermissions (req: Request, requiredRole: Roles) {
        const authToken = getAuthorization(req)
        if (!await AuthService.getInstance().isValidRoleAndSession(authToken, Roles.toString(requiredRole))) {
            throw new ErrorResponse("You don't have permissions !", 403)
        }
    }
}