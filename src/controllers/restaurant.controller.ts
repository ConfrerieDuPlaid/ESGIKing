import {DefaultController} from "./default.controller";
import express, {Request, Response, Router} from "express";
import {AuthService, RestaurantService} from "../services";
import {ErrorResponse, getAuthorization} from "../utils";
import {Roles} from "../utils/roles";
import {StaffModel} from "../models";
import {GpsPoint} from "../utils/gps.point";

export class RestaurantController extends DefaultController {
    buildRoutes (): Router {
        const router = express.Router()
        router.put('/', express.json(), this.createRestaurant.bind(this))
        router.get('/:restaurantID', this.getOneRestaurant.bind(this))
        router.get('/', this.getAllRestaurants.bind(this))
        router.delete('/:restaurantID', this.deleteRestaurant.bind(this))
        router.patch('/addProduct/', express.json(), this.addAproductInRestaurant.bind(this))
        router.patch('/:restaurantID', express.json(), this.updateRestaurant.bind(this))
        return router
    }

    async createRestaurant (req: Request, res: Response) {
        await super.sendResponse(req, res, async () => {
            await AuthService.getInstance().verifyPermissions(req, Roles.BigBoss)
            return await RestaurantService.getInstance().createRestaurant({
                name: req.body.name,
                address: req.body.address,
                location: this.getGpsPointInGeoJsonFromRequest(req)
            })
        }, 201)
    }

    private getGpsPointInGeoJsonFromRequest(req: express.Request): GpsPoint {
        const geoJsonGeometry = req.body.location?.features[0]?.geometry;
        if(!this.isGeoJsonValid(geoJsonGeometry))
            throw new ErrorResponse("Bad GeoJSON", 400);

        return new GpsPoint(
            geoJsonGeometry.coordinates[0],
            geoJsonGeometry.coordinates[1]
        );
    }

    private isGeoJsonValid(location?: {type: string, coordinates: number[]}): boolean {
        if(!location) return false;
        const isPointType = location.type.toLowerCase() === "point";
        const coordinates = location.coordinates;
        const isCoordinatesArrayOfTwoNumbers = coordinates.length === 2
            && !isNaN(+coordinates[0]) && !isNaN(+coordinates[1]);
        return isPointType && isCoordinatesArrayOfTwoNumbers;
    }

    async getOneRestaurant (req: Request, res: Response) {
        await super.sendResponse(req, res, async () => {
            await AuthService.getInstance().verifyPermissions(req, Roles.BigBoss)
            return await RestaurantService.getInstance().getOneRestaurant(req.params.restaurantID)
        })
    }

    async getAllRestaurants (req: Request, res: Response) {
        await super.sendResponse(req, res, async () => {
            await AuthService.getInstance().verifyPermissions(req, Roles.BigBoss)
            return await RestaurantService.getInstance().getAllRestaurants()
        })
    }

    async deleteRestaurant (req: Request, res: Response) {
        await super.sendResponse(req, res, async () => {
            await AuthService.getInstance().verifyPermissions(req, Roles.BigBoss)
            const res: boolean = await RestaurantService.getInstance().deleteRestaurant(req.params.restaurantID)
            if (!res) {
                throw new ErrorResponse("An error occurred", 500)
            }
            return res
        }, 204)
    }

    async updateRestaurant (req: Request, res: Response) {
        await super.sendResponse(req, res, async () => {
            await AuthService.getInstance().verifyPermissions(req, Roles.BigBoss)
            const res: boolean = await RestaurantService.getInstance().updateRestaurant(req.params.restaurantID, req.body)
            if (!res) {
                throw new ErrorResponse("An error occurred", 500)
            }
            return res
        }, 204)
    }

    async addAproductInRestaurant(req: Request, res: Response){
        await super.sendResponse(req, res, async () => {

            const authToken = getAuthorization(req);
            const res: boolean = await RestaurantService.getInstance().addAProductInRestaurant(req.body.restaurantID, req.body.productId, authToken);
            if (!res) {
                throw new ErrorResponse("The product cannot be added to the restaurant", 500)
            }
            return res
        }, 204)
    }
}
