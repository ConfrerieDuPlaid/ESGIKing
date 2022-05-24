import {DefaultController} from "./default.controller";
import express, {Request, Response, Router} from "express";
import {AuthService, ProductsService, RestaurantService} from "../services";
import {ErrorResponse, getAuthorization} from "../utils";
import {Roles} from "../utils/roles";
import {StaffModel} from "../models";
import {Product} from "../services/products/domain/product";
import {ProductResponseAdapter} from "./products/product.response.adapter";
import {HttpUtils} from "../utils/http.utils";
import {GpsPoint} from "../utils/gps.point";

export class RestaurantController extends DefaultController {

    readonly restaurantService = RestaurantService.getInstance();

    buildRoutes (): Router {
        const router = express.Router()
        router.put('/', express.json(), this.createRestaurant.bind(this))
        router.get('/:restaurantID', this.getOneRestaurant.bind(this))
        router.get('/:restaurantId/products', this.getProductsInRestaurant.bind(this))
        router.get('/', this.getAllRestaurants.bind(this))
        router.delete('/:restaurantID', this.deleteRestaurant.bind(this))
        router.patch('/addProduct/', express.json(), this.addAproductInRestaurant.bind(this))
        router.patch('/:restaurantID', express.json(), this.updateRestaurant.bind(this))
        return router
    }

    /**
     * Method : PUT
     * URL : /restaurant
     * Permissions required : BigBoss
     *
     * @param req HTTP request object with JSON object
     * {
     *     "name": "ESGIKing 3",
     *     "address": "245 rue du Faubourg Saint-Antoine, 75012 Paris",
     *     "location": {
     *         "type": "FeatureCollection",
     *         "version": "draft",
     *         "features": [
     *             {
     *                 "type": "Feature",
     *                 "geometry": {
     *                     "type": "Point",
     *                     "coordinates": [
     *                         2.382282,
     *                         48.850217
     *                     ]
     *                 },
     *                 "properties": {
     *                     "label": "Rue du Faubourg Saint-Antoine 75012 Paris",
     *                     "score": 0.8153916528925618,
     *                     "id": "75112_3514",
     *                     "name": "Rue du Faubourg Saint-Antoine",
     *                     "postcode": "75012",
     *                     "citycode": "75112",
     *                     "x": 654670.63,
     *                     "y": 6861307.84,
     *                     "city": "Paris",
     *                     "district": "Paris 12e Arrondissement",
     *                     "context": "75, Paris, Île-de-France",
     *                     "type": "street",
     *                     "importance": 0.78749
     *                 }
     *             }
     *         ],
     *         "attribution": "BAN",
     *         "licence": "ETALAB-2.0",
     *         "query": "243 rue du Faubourg Saint-Antoine, 75012 Paris",
     *         "limit": 5
     *     }
     * }
     * @param res HTTP response object
     *
     * @returns ResponseDocument or 500 error
     */
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

    /**
     * Method : GET
     * URL : /restaurant/:restaurantId
     * Permissions required : BigBoss
     *
     * @param req HTTP request object
     * @param res HTTP response object
     *
     * @returns ResponseDocument or 500 error
     */
    async getOneRestaurant (req: Request, res: Response) {
        await super.sendResponse(req, res, async () => {
            await AuthService.getInstance().verifyPermissions(req, Roles.BigBoss)
            return await RestaurantService.getInstance().getOneRestaurant(req.params.restaurantID)
        })
    }

    /**
     * Method : GET
     * URL : /restaurant
     * Permissions required : BigBoss
     *
     * @param req HTTP request object
     * @param res HTTP response object
     *
     * @returns ResponseDocument array or 500 error
     */
    async getProductsInRestaurant(req: Request, res: Response) {
        await super.sendResponse(req, res, async () => {
            const restaurant = await this.restaurantService.getOneRestaurant(req.params.restaurantId);
            if(!restaurant?.products) throw new ErrorResponse(`Restaurant ${req.params.restaurantId} not found.`, 404);
            return restaurant.products
                .map(id => `${HttpUtils.getBaseUrlOf(req)}/products/${id}`);
        });
    }

    async getAllRestaurants (req: Request, res: Response) {
        await super.sendResponse(req, res, async () => {
            await AuthService.getInstance().verifyPermissions(req, Roles.BigBoss)
            return await RestaurantService.getInstance().getAllRestaurants()
        })
    }

    /**
     * Method : DELETE
     * URL : /restaurant/:restaurantId
     * Permissions required : BigBoss
     *
     * @param req HTTP request object
     * @param res HTTP response object
     *
     * @returns Void or 500 error
     */
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

    /**
     * Method : PATCH
     * URL : /restaurant/:restaurantId
     * Permissions required : BigBoss
     *
     * @param req HTTP request object with JSON object
     * {
     *     "name": "{{name}}",
     *     "address": "{{address}}"
     * }
     * @param res HTTP response object
     *
     * @returns ResponseDocument or 500 error
     */
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

    /**
     * Method : PATCH
     * URL : /restaurant/addProduct
     * Permissions required : BigBoss
     *
     * @param req HTTP request object with JSON object
     * {
     *     "restaurantID" : "{{restaurantId}}",
     *     "productId" : "{{productId}}"
     * }
     * @param res HTTP response object
     *
     * @returns RestaurantDocument or 500 error
     */
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
