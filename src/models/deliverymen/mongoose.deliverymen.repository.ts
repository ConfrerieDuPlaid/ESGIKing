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

    async getById(deliverymanId: string): Promise<Deliveryman> {
        return await DeliverymanModel.findOne({_id: deliverymanId}).exec();
    }

    async save(deliveryman: Deliveryman): Promise<Deliveryman> {
        const found = await DeliverymanModel.findOne({_id: deliveryman.id.value}).exec();
        if(!found)return this.create(deliveryman);
        else {
            found.position = deliveryman.position;
            found.status = deliveryman.status;
        }
        return DeliverymanAdapter.adapt(found.save());
    }

}
