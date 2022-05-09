import {DefaultController} from "../default.controller";
import express, {Request, Response, Router} from "express";
import {ErrorResponse, getAuthorization} from "../../utils";
import {AuthService} from "../../services";
import {Roles} from "../../utils/roles";
import {MenuService} from "../../services/menus/menu.service";
import {MenuDocument, MenuProps} from "../../models/menus/menu.model";

export class MenuController extends DefaultController{


    private readonly menuService: MenuService = MenuService.getInstance();

    buildRoutes (): Router {
        const router = express.Router()
        router.get('/:menuId', this.getMenu.bind(this))
        router.put('/', express.json(), this.createMenu.bind(this))
        router.patch('/:restaurantId', express.json(), this.updateMenu.bind(this))
        router.delete('/:menuId', this.deleteMenu.bind(this))
        return router
    }

    async getMenu (req: Request, res: Response) {
        await super.sendResponse(req, res, async () => {
            const authToken = getAuthorization(req)
            await AuthService.getInstance().verifyPermissions(req, Roles.OrderPicker); //À MODIFIER POUR RAJOUTER L'ADMIN QUAND LA PR AURA ÉTÉ VALIDÉE
            const res: MenuDocument | null = await MenuService.getInstance().getMenu(req.params.menuId)
            if (res === null) {
                throw new ErrorResponse("Not found", 404)
            }
            return res //TO PASS BY ADAPTER
        }, 200)
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