import express, {Request, Response, Router} from "express";
import {DefaultController} from "./default.controller";
import {ErrorResponse} from "../utils";
import {Roles} from "../utils/roles";
import {AuthService, StaffService} from "../services";

export class StaffController extends DefaultController{
    buildRoutes (): Router {
        const router = express.Router()
        router.get('/:ressourceID', this.getEmployee.bind(this))
        router.get('/', this.getAllEmployees.bind(this))
        router.put('/', express.json(), this.addEmployee.bind(this))
        router.delete('/', express.json(), this.removeEmployee.bind(this))
        return router
    }

    /**
     * Method : PUT
     * URL : /staff
     * Permissions required : BigBoss
     *
     * @param req HTTP request object with JSON object
     * {
     *     "restaurantID": "{{restaurantId}}",
     *     "userID": "{{userId}}",
     *     "role": "{{role name}}"
     *     }
     * @param res HTTP response object
     *
     * @returns StaffDocument or 500 error
     */
    async addEmployee (req: Request, res: Response) {
        await super.sendResponse(req, res, async () => {
            await AuthService.getInstance().verifyPermissions(req, Roles.BigBoss)
            return StaffService.getInstance().addStaff(req.body)
        }, 201)
    }

    /**
     * Method : DELETE
     * URL : /staff
     * Permissions required : BigBoss
     *
     * @param req HTTP request object with JSON object
     * {
     *     "restaurantID": "{{restaurantId}}",
     *     "userID": "{{userId}}"
     * }
     * @param res HTTP response object
     *
     * @returns void or 500 error
     */
    async removeEmployee (req: Request, res: Response) {
        await super.sendResponse(req, res, async () => {
            await AuthService.getInstance().verifyPermissions(req, Roles.BigBoss)
            const res: boolean = await StaffService.getInstance().deleteStaff(req.body)
            if (!res) {
                throw new ErrorResponse("An error occurred", 500)
            }
            return res
        }, 204)
    }

    /**
     * Method : GET
     * URL : /staff
     * Permissions required : BigBoss
     *
     * @param req HTTP request object
     * @param res HTTP response object
     *
     * @returns StaffDocument array or 500 error
     */
    async getAllEmployees (req: Request, res: Response) {
        await super.sendResponse(req, res, async () => {
            return StaffService.getInstance().getAllStaff()
        })
    }

    /**
     * Method : GET
     * URL : /staff/:staffId/?{{ressource}}={{ressourceId}} where ressource can be "staff" or "restaurant"
     * Permissions required : BigBoss
     *
     * @param req HTTP request object
     * @param res HTTP response object
     *
     * @returns StaffDocument or 500 error
     */
    async getEmployee (req: Request, res: Response) {
        await super.sendResponse(req, res, async () => {
            if (req.query.ressource === "restaurant") {
                return StaffService.getInstance().getStaffByRestaurant(req.params.ressourceID)
            }
            if (req.query.ressource === "staff") {
                return StaffService.getInstance().getStaffByUser(req.params.ressourceID)
            }
            throw new ErrorResponse("Not found", 404)
        })
    }
}
