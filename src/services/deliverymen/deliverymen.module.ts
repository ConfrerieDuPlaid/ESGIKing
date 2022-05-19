import {DeliverymenRepository} from "./domain/deliverymen.repository";
import {MongooseProductsRepository} from "../../models/product/mongoose.products.repository";
import {MongooseDeliverymenRepository} from "../../models/deliverymen/mongoose.deliverymen.repository";

export class DeliverymenModule {
    static repository(): DeliverymenRepository {
        return new MongooseDeliverymenRepository();
    }
}
