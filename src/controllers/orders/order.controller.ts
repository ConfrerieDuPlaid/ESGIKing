import {DefaultController} from "../default.controller";
import express, {Request, Response, Router} from "express";
import {ErrorResponse, getAuthorization} from "../../utils";
import {AuthService} from "../../services";
import {Roles} from "../../utils/roles";
import {OrderService} from "../../services/orders/order.service";
import {OrderDocument, OrderProps} from "../../models/orders/order.model";
import {OrderStatus} from "../../services/orders/order.status";

export class OrderController extends DefaultController{


    private readonly orderService: OrderService = OrderService.getInstance();

    buildRoutes (): Router {
        const router = express.Router()
        router.put('/', express.json(), this.createOrder.bind(this))
        router.get('/:restaurantId/status/:status', express.json(), this.getOrdersByRestaurantIdAndStatus.bind(this))
        router.patch('/:orderId', express.json(), this.updateOrder.bind(this))
        return router
    }


    async createOrder(req : Request, res: Response) {
        await super.sendResponse(req, res, async () => {
            await AuthService.getInstance().verifyPermissions(req, Roles.Customer);
            const res: Boolean | OrderProps = await this.orderService.createOrder({
                status: OrderStatus[0],
                restaurant: req.body.restaurant,
                products: req.body.products,
                amount: 0,
                menus: req.body.menus ? req.body.menus : null,
                reductionId: req.body.reduction ? req.body.reduction : null,
                customer: req.body.customer ? req.body.customer : null,
            });
            if(!res){
                throw new ErrorResponse("The order cannot be placed", 500)
            }else{
                return res;
            }
        }, 201);
    }

    async getOrdersByRestaurantIdAndStatus(req: Request, res: Response){
        await super.sendResponse(req, res, async () => {
            await AuthService.getInstance().verifyPermissions(req, [Roles.OrderPicker, Roles.Admin]);
            const authToken = getAuthorization(req);
            const res: OrderDocument[] = await this.orderService.getOrdersByRestaurantIdAndStatus(req.params.restaurantId, authToken, req.params.status);
            if(!res){
                throw new ErrorResponse("The order cannot be placed", 500)
            }else{
                return res;
            }
        }, 201);
    }

    async updateOrder(req: Request, res: Response){
        await super.sendResponse(req, res, async () => {
            await AuthService.getInstance().verifyPermissions(req, Roles.OrderPicker);
            const authToken = getAuthorization(req);
            let res: Boolean = false;
            if(req.query.status){
                res = await this.orderService.updateOrder(req.params.orderId, req.query.status.toString() , authToken);
            }
            if(!res){
                throw new ErrorResponse("The order cannot be update", 400)
            }
        }, 201);
    }

}