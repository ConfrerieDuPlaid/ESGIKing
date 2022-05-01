import {DefaultController} from "../default.controller";
import express, {Request, Response, Router} from "express";
import {ErrorResponse, getAuthorization} from "../../utils";
import {AuthService} from "../../services";
import {Roles} from "../../utils/roles";
import {OrderService} from "../../services/orders/order.service";

export class OrderController extends DefaultController{


    private readonly orderService: OrderService = OrderService.getInstance();

    buildRoutes (): Router {
        const router = express.Router()
        router.put('/', express.json(), this.createOrder.bind(this))
        router.patch('/:restaurantId', express.json(), this.updateOrder.bind(this))
        return router
    }


    async createOrder(req : Request, res: Response) {
        await super.sendResponse(req, res, async () => {
            await AuthService.getInstance().verifyPermissions(req, Roles.OrderPicker);
            const res: Boolean = await this.orderService.createOrder({
                status: 1,
                restaurant: req.body.restaurant,
                products: req.body.products,
                amount: 0,
                menus: req.body.menus ? req.body.menus : null,
                reductionId: req.body.reduction ? req.body.reduction : null,
            });
            if(!res){
                throw new ErrorResponse("The order cannot be placed", 500)
            }
        }, 201);
    }

    async updateOrder(req: Request, res: Response){
       throw new ErrorResponse("ToDo", 500);
    }

}