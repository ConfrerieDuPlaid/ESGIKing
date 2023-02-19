import {DeliverymanId} from "./deliveryman.id";
import {GpsPoint} from "../../../utils/gps.point";
import {DeliverymenStatus} from "./deliverymen.status";


export class Deliveryman implements DeliverymanProps{
    readonly id: DeliverymanId;
    readonly name: string;
    readonly phoneNumber: string;
    readonly token: string;
    readonly position: GpsPoint;
    status: DeliverymenStatus;

    constructor(props: DeliverymanProps) {
        this.id = props.id;
        this.name = props.name;
        this.phoneNumber = props.phoneNumber;
        this.token = props.token;
        this.position = props.position;
        this.status = props.status;
    }

    static withoutId(props: DeliverymanWithoutId): DeliverymanWithoutId {
        return {
            name: props.name,
            phoneNumber: props.phoneNumber,
            token: props.token,
            position: props.position,
            status: props.status
        }
    }
}

export interface DeliverymanProps {
    readonly id: DeliverymanId;
    readonly name: string;
    readonly phoneNumber: string;
    readonly token:  string;
    readonly position: GpsPoint;
    readonly status: DeliverymenStatus;
}

export type DeliverymanWithoutId = Pick<DeliverymanProps, "name" | "position" | "status" | "phoneNumber" | "token">
