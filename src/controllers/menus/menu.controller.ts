import {DefaultController} from "../default.controller";
import express, {Request, Response, Router} from "express";
import {ErrorResponse, getAuthorization} from "../../utils";
import {AuthService} from "../../services";
import {Roles} from "../../utils/roles";
import {MenuService} from "../../services/menus/menu.service";

export class MenuController extends DefaultController{


    private readonly menuService: MenuService = MenuService.getInstance();

    buildRoutes (): Router {
        const router = express.Router()
        router.put('/', express.json(), this.createMenu.bind(this))
        return router
    }


    async createMenu(req : Request, res: Response) {
        await super.sendResponse(req, res, async () => {
            const authToken = getAuthorization(req);
            await AuthService.getInstance().verifyPermissions(req, Roles.Admin);
            const res: Boolean = await this.menuService.createMenu({
                    name: req.body.name,
                    restaurant: req.body.restaurant,
                    products: req.body.products,
                    amount: +req.body.amount
                }, authToken);
            if(!res){
                throw new ErrorResponse("The menu cannot be added to the restaurant", 500)
            }
        }, 201);
    }


}