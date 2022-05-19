import {DefaultController} from "../index";
import express, {Request, Response, Router} from "express";
import {DeliverymanResponseAdapter} from "./deliveryman.response.adapter";
import {Product} from "../../services/products/domain/product";
import {Deliveryman} from "../../services/deliverymen/domain/deliveryman";
import {DeliverymenService} from "../../services/deliverymen/deliverymen.service";

export class DeliverymenController extends DefaultController {
    private readonly deliverymenService: DeliverymenService = DeliverymenService.getInstance();

    buildRoutes(): Router {
        const router = express.Router()
        router.get('/', this.getAllDeliverymen.bind(this));
        router.post('/', express.json(), this.addDeliveryman.bind(this));
        return router;
    }

    async getAllDeliverymen(req: Request, res: Response) {
        await super.sendResponse(req, res, async () => {
            const deliverymen: Deliveryman[] = await this.deliverymenService
                .getAllDeliverymen(req.query.status?.toString())
            return deliverymen.map(deliveryman => DeliverymanResponseAdapter.adapt(deliveryman));
        });
    }

    async addDeliveryman(req: Request, res: Response) {
        await super.sendResponse(req, res, async () => {
            const deliveryman: Deliveryman = await this.deliverymenService.registerDeliveryman({
                name: req.body.name,
                position: req.body.position,
                status: "created"
            });
            return DeliverymanResponseAdapter.adapt(deliveryman);
        }, 201);
    }

}
