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
        router.get('/restaurant/:restaurantId', this.getMenuByRestaurantId.bind(this))
        router.get('/', express.json(), this.getAllMenu.bind(this))
        router.put('/', express.json(), this.createMenu.bind(this))
        router.patch('/:menuId', express.json(), this.updateMenu.bind(this))
        router.delete('/:menuId', this.deleteMenu.bind(this))
        return router
    }

    /**
     * Method : GET
     * URL : /menu/:menuID
     * Permissions required : logged in as OrderPicker or Admin
     *
     * @param req HTTP request object
     * @param res HTTP response object
     *
     * @returns MenuDocument with menu data or 404 error if menu not found
     */
    async getMenu (req: Request, res: Response) {
        await super.sendResponse(req, res, async () => {
            const authToken = getAuthorization(req)
            await AuthService.getInstance().verifyPermissions(req, [Roles.OrderPicker, Roles.Admin]);
            const menu: MenuDocument | null = await MenuService.getInstance().getMenu(req.params.menuId, authToken)
            if (menu === null) {
                throw new ErrorResponse("Not found", 404)
            }
            return MenuResponseAdapter.adapt(menu, req)
        }, 200)
    }

    /**
     * Method : GET
     * URL : /menu
     * Permissions required : logged in as BigBoss
     *
     * @param req HTTP request object
     * @param res HTTP response object
     *
     * @returns MenuDocument array with menu data or empty list not found
     */
    async getAllMenu(req : Request, res: Response){
        await super.sendResponse(req, res, async () => {
            await AuthService.getInstance().verifyPermissions(req, Roles.BigBoss)
            const menus = await this.menuService.getAllMenu(req.query.order?.toString());
            return menus.map(menu => MenuResponseAdapter.adapt(menu, req))
        }, 201);
    }

    async getMenuByRestaurantId(req : Request, res: Response){
        await super.sendResponse(req, res, async () => {
            await AuthService.getInstance().verifyPermissions(req, Roles.Customer)
            const restaurantId = req.params.restaurantId!.toString()
            const orderBy = req.query.order?.toString()
            const menus = await this.menuService.getMenuByRestaurantId(restaurantId, orderBy);
            return menus.map(menu => MenuResponseAdapter.adapt(menu, req))
        }, 201);
    }

    /**
     * Method : PUT
     * URL : /menu
     * Permissions required : logged in as Admin
     *
     * @param req HTTP request object with JSON object
     *  {
     *     "name" : "{{menu name}}",
     *     "restaurant": "{{restaurantId}}",
     *     "products" : ["{{productId1}}", "{{productId2}}"],
     *     "amount" : {{amount}}
     * }
     * @param res HTTP response object
     *
     * @returns MenuDocument for created menu or 500 error
     */
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

    /**
     * Method : PATCH
     * URL : /menu/:menuId
     * Permissions required : logged in as Admin
     *
     * @param req HTTP request object with JSON object
     * {
     *     "menuId": "{{menuId}}",
     *     "name" : "{{menu name}}"
     * }
     * @param res HTTP response object
     *
     * @returns void or 500 error
     */
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

    /**
     * Method : DELETE
     * URL : /menu/:menuID
     * Permissions required : logged in as Admin
     *
     * @param req HTTP request object
     * @param res HTTP response object
     *
     * @returns Void or 500 error
     */
    async deleteMenu (req: Request, res: Response) {
        await super.sendResponse(req, res, async () => {
            const authToken = getAuthorization(req);
            await AuthService.getInstance().verifyPermissions(req, Roles.Admin);
            const res: boolean = await MenuService.getInstance().deactivateMenu(req.params.menuId, authToken)
            if (!res) throw new ErrorResponse("An error occurred", 500)
        }, 204)
    }
}
