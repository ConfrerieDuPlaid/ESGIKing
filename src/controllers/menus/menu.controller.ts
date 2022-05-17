import {DefaultController} from "../default.controller";
import express, {Request, Response, Router} from "express";
import {ErrorResponse, getAuthorization} from "../../utils";
import {AuthService} from "../../services";
import {Roles} from "../../utils/roles";
import {MenuService} from "../../services/menus/menu.service";
import {MenuDocument, MenuProps} from "../../models/menus/menu.model";
import {MenuResponseAdapter} from "./menu.response.adapter";

export class MenuController extends DefaultController{


    private readonly menuService: MenuService = MenuService.getInstance();

    buildRoutes (): Router {
        const router = express.Router()
        router.get('/:menuId', this.getMenu.bind(this))
        router.get('/', express.json(), this.getAllMenu.bind(this))
        router.put('/', express.json(), this.createMenu.bind(this))
        router.patch('/:menuId', express.json(), this.updateMenu.bind(this))
        router.delete('/:menuId', this.deleteMenu.bind(this))
        return router
    }

    async getMenu (req: Request, res: Response) {
        await super.sendResponse(req, res, async () => {
            const authToken = getAuthorization(req)
            await AuthService.getInstance().verifyPermissions(req, [Roles.OrderPicker, Roles.Admin]);
            const menu: MenuDocument | null = await MenuService.getInstance().getMenu(req.params.menuId, authToken)
            if (menu === null) {
                throw new ErrorResponse("Not found", 404)
            }
            return MenuResponseAdapter.adapt(menu)
        }, 200)
    }

    async getAllMenu(req : Request, res: Response){
        await super.sendResponse(req, res, async () => {
            await AuthService.getInstance().verifyPermissions(req, Roles.BigBoss)
            const menus = await this.menuService.getAllMenu();
            return menus.map(menu => MenuResponseAdapter.adapt(menu))

        }, 201);
    }

    async createMenu(req : Request, res: Response) {
        await super.sendResponse(req, res, async () => {
            const authToken = getAuthorization(req);
            await AuthService.getInstance().verifyPermissions(req, Roles.Admin);
            const res: MenuProps | Boolean = await this.menuService.createMenu({
                    name: req.body.name,
                    restaurant: req.body.restaurant,
                    products: req.body.products,
                    amount: +req.body.amount
                }, authToken);
            if(!res || res == false){
                throw new ErrorResponse("The menu cannot be added to the restaurant", 500)
            }
            return res
        }, 201);
    }

    async updateMenu(req: Request, res: Response){
        await super.sendResponse(req, res, async () => {
            const authToken = getAuthorization(req);
            await AuthService.getInstance().verifyPermissions(req, Roles.Admin);
            const res: Boolean = await this.menuService.updateMenu(req.body, req.body.menuId, req.params.restaurantId, authToken);
            if(!res){
                throw new ErrorResponse("The menu cannot be update", 500)
            }
        }, 201);
    }

    async deleteMenu (req: Request, res: Response) {
        await super.sendResponse(req, res, async () => {
            const authToken = getAuthorization(req);
            await AuthService.getInstance().verifyPermissions(req, Roles.Admin);
            const res: boolean = await MenuService.getInstance().deactivateMenu(req.params.menuId, authToken)
            if (!res) throw new ErrorResponse("An error occurred", 500)
        }, 204)
    }
}