import express, {Request, Response, Router} from "express";
import {DefaultController} from "./default.controller";
import {verifyPermissions} from "../utils";
import {Roles} from "../utils/roles";
import {StaffService} from "../services";

export class StaffController extends DefaultController{
    buildRoutes (): Router {
        const router = express.Router()
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
            return StaffService.getInstance().deleteStaff(req.body)
        }, 204)
    }
}