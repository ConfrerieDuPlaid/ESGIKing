import {Deliveryman} from "../../services/deliverymen/domain/deliveryman";
import {DeliverymanResponse} from "./deliveryman.response";

export class DeliverymanResponseAdapter {
    static adapt(deliveryman: Deliveryman): DeliverymanResponse {
        return {
            id: deliveryman.id.value,
            name: deliveryman.name,
            position: deliveryman.position,
            status: deliveryman.status
        };
    }
}
