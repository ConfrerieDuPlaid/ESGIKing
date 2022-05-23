import {DeliverymanId} from "./deliveryman.id";
import {GpsPoint} from "../../../utils/gps.point";
import {DeliverymenStatus} from "./deliverymen.status";


export class Deliveryman implements DeliverymanProps{
    readonly id: DeliverymanId;
    readonly name: string;
    readonly position: GpsPoint;
    status: DeliverymenStatus;

    constructor(props: DeliverymanProps) {
        this.id = props.id;
        this.name = props.name;
        this.position = props.position;
        this.status = props.status;
    }

    static withoutId(props: DeliverymanWithoutId): DeliverymanWithoutId {
        return {
            name: props.name,
            position: props.position,
            status: props.status
        }
    }

}

export interface DeliverymanProps {
    readonly id: DeliverymanId;
    readonly name: string;
    readonly position: GpsPoint;
    readonly status: DeliverymenStatus;
}

export type DeliverymanWithoutId = Pick<DeliverymanProps, "name" | "position" | "status">
