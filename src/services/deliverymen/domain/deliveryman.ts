import {DeliverymanId} from "./deliveryman.id";
import {GpsPoint} from "../../../utils/gps.point";


export class Deliveryman implements DeliverymanProps{
    readonly id: DeliverymanId;
    readonly name: string;
    readonly position: GpsPoint;
    readonly status: string;

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
    readonly status: string;
}

export type DeliverymanWithoutId = Pick<DeliverymanProps, "name" | "position" | "status">
