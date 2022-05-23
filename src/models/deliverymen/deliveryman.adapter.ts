import {DeliverymanDocument} from "./mongoose.deliverymen.model";
import {Deliveryman} from "../../services/deliverymen/domain/deliveryman";
import {GpsPoint} from "../../utils/gps.point";
import {getDeliverymanStatusFromString} from "../../services/deliverymen/domain/deliverymen.status";
import {DeliverymanId} from "../../services/deliverymen/domain/deliveryman.id";

export class DeliverymanAdapter {
    static adapt(source: DeliverymanDocument): Deliveryman {
        return new Deliveryman({
            id: new DeliverymanId(source._id),
            name: source.name,
            position: new GpsPoint(
                source.position.longitude,
                source.position.latitude
                ),
            status: getDeliverymanStatusFromString(source.status)
        });
    }
}
