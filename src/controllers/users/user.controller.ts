import {DefaultController} from "../default.controller";
import {AuthService} from "../../services";
import {Roles} from "../../utils/roles";
import {UserService} from "../../services/user.service";
import {getAuthorization} from "../../utils";
import express, {Request, Response, Router} from "express";

export class UserController extends DefaultController{
    private readonly userService: UserService = UserService.getInstance();

    buildRoutes (): Router {
        const router = express.Router()

        router.get('/:userId/orders', express.json(), this.getAllOrderOfOneUserByStatus.bind(this))
        return router
    }

    async getAllOrderOfOneUserByStatus(req : Request, res: Response){
        await super.sendResponse(req, res, async () => {
            await AuthService.getInstance().verifyPermissions(req, Roles.Customer)
            const authToken = getAuthorization(req);
            return await this.userService.getOrdersByStatusAndUserId(req.query.status!.toString(), req.params.userId, authToken);
        }, 201);
    }

}