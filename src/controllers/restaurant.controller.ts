import {DefaultController} from "./default.controller";
import express, {Request, Response, Router} from "express";
import {RestaurantService} from "../services";
import {verifyPermissions} from "../utils";
import {Roles} from "../utils/roles";

export class RestaurantController extends DefaultController {
    buildRoutes (): Router {
        const router = express.Router()
        router.put('/add', express.json(), this.createRestaurant.bind(this))
        router.get('/getOne', express.json(), this.getOneRestaurant.bind(this))
        router.get('/getAll', this.getAllRestaurants.bind(this))
        router.delete('/deleteOne', express.json(), this.deleteRestaurant.bind(this))
        router.patch('/updateAdmin', express.json(), this.updateAdmin.bind(this))
        return router
    }

    async createRestaurant (req: Request, res: Response) {
        await super.sendResponse(req, res, async () => {
            await verifyPermissions
    (req, Roles.BigBoss)
            return await RestaurantService.getInstance().createRestaurant({
                name: req.body.name,
                address: req.body.address
            })
        })
    }

    async getOneRestaurant (req: Request, res: Response) {
        await super.sendResponse(req, res, async () => {
            await verifyPermissions
    (req, Roles.BigBoss)
            return await RestaurantService.getInstance().getOneRestaurant(req.body.id)
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
            return await RestaurantService.getInstance().deleteRestaurant(req.body.id)
        })
    }

    async updateAdmin (req: Request, res: Response) {
        await super.sendResponse(req, res, async () => {
            await verifyPermissions(req, Roles.BigBoss)
            return await RestaurantService.getInstance().updateAdmin(req.body.restaurant, req.body.admin)
        })
    }
}