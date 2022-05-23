import {DeliverymenRepository} from "./domain/deliverymen.repository";
import {MongooseDeliverymenRepository} from "../../models/deliverymen/mongoose.deliverymen.repository";

export class DeliverymenModule {
    static repository(): DeliverymenRepository {
        return new MongooseDeliverymenRepository();
    }
}
