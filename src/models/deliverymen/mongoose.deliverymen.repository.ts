import {DeliverymanDocument, DeliverymanModel} from "./mongoose.deliverymen.model";
import {DeliverymanAdapter} from "./deliveryman.adapter";
import {DeliverymenRepository} from "../../services/deliverymen/domain/deliverymen.repository";
import {Deliveryman, DeliverymanWithoutId} from "../../services/deliverymen/domain/deliveryman";

export class MongooseDeliverymenRepository implements DeliverymenRepository{
    async getAll(): Promise<Deliveryman[]> {
        const deliverymen: DeliverymanDocument[] = await DeliverymanModel.find().exec();
        return deliverymen.map(deliveryman => DeliverymanAdapter.adapt(deliveryman));
    }

    async create(deliveryman: DeliverymanWithoutId): Promise<Deliveryman> {
        const created: DeliverymanDocument = await DeliverymanModel.create(deliveryman);
        return DeliverymanAdapter.adapt(created);
    }

}
