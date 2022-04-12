import express, {Request, Response, Router} from "express";
import {DefaultController} from "./default.controller";
import {DataUtils, ErrorResponse, verifyPermissions} from "../utils";
import {Roles} from "../utils/roles";
import {StaffService} from "../services";

export class StaffController extends DefaultController{
    buildRoutes (): Router {
        const router = express.Router()
        router.get('/:ressourceID', this.getEmployee.bind(this))
        router.get('/', this.getAllEmployees.bind(this))
        router.put('/', express.json(), this.addEmployee.bind(this))
        router.delete('/', express.json(), this.removeEmployee.bind(this))
        return router
    }

    async addEmployee (req: Request, res: Response) {
        await super.sendResponse(req, res, async () => {
            await verifyPermissions(req, Roles.BigBoss)
            return StaffService.getInstance().addStaff(req.body)
        }, 201)
    }

    async removeEmployee (req: Request, res: Response) {
        await super.sendResponse(req, res, async () => {
            await verifyPermissions(req, Roles.BigBoss)
            const res: boolean = await StaffService.getInstance().deleteStaff(req.body)
            if (!res) {
                throw new ErrorResponse("An error occurred", 500)
            }
            return res
        }, 204)
    }

    async getAllEmployees (req: Request, res: Response) {
        await super.sendResponse(req, res, async () => {
            return StaffService.getInstance().getAllStaff()
        })
    }

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