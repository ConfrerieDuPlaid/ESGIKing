import {DefaultController} from "./default.controller";
import express, {Request, Response, Router} from "express";
import {RestaurantService} from "../services";
import {verifyPermissions} from "../utils";
import {Roles} from "../utils/roles";

export class RestaurantController extends DefaultController {
    buildRoutes (): Router {
        const router = express.Router()
        router.put('/', express.json(), this.createRestaurant.bind(this))
        router.get('/:restaurantID', this.getOneRestaurant.bind(this))
        router.get('/', this.getAllRestaurants.bind(this))
        router.delete('/:restaurantID', this.deleteRestaurant.bind(this))
        router.patch('/:restaurantID', express.json(), this.updateRestaurant.bind(this))
        return router
    }

    async createRestaurant (req: Request, res: Response) {
        await super.sendResponse(req, res, async () => {
            await verifyPermissions(req, Roles.BigBoss)
            return await RestaurantService.getInstance().createRestaurant({
                name: req.body.name,
                address: req.body.address
            })
        }, 201)
    }

    async getOneRestaurant (req: Request, res: Response) {
        await super.sendResponse(req, res, async () => {
            await verifyPermissions(req, Roles.BigBoss)
            return await RestaurantService.getInstance().getOneRestaurant(req.params.restaurantID)
        })
    }

    async getAllRestaurants (req: Request, res: Response) {
        await super.sendResponse(req, res, async () => {
            await verifyPermissions(req, Roles.BigBoss)
            return await RestaurantService.getInstance().getAllRestaurants()
        })
    }

    async deleteRestaurant (req: Request, res: Response) {
        await super.sendResponse(req, res, async () => {
            await verifyPermissions(req, Roles.BigBoss)
            return await RestaurantService.getInstance().deleteRestaurant(req.params.restaurantID)
        }, 204)
    }

    async updateRestaurant (req: Request, res: Response) {
        await super.sendResponse(req, res, async () => {
            await verifyPermissions(req, Roles.BigBoss)
            return await RestaurantService.getInstance().updateRestaurant(req.params.restaurantID, req.body)
        }, 204)
    }
}