import {GpsPoint} from "../../utils/gps.point";

export interface DeliverymanResponse {
    id: string,
    name: string,
    status: string,
    position: GpsPoint,
}
