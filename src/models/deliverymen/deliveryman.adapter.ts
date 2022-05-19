import {DeliverymanDocument} from "./mongoose.deliverymen.model";
import {Deliveryman} from "../../services/deliverymen/domain/deliveryman";

export class DeliverymanAdapter {
    static adapt(source: DeliverymanDocument): Deliveryman {
        return new Deliveryman({
            id: source.id,
            name: source.name,
            position: source.position,
            status: source.status
        });
    }
}
