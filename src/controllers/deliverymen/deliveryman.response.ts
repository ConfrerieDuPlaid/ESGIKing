import {GpsPoint} from "../../utils/gps.point";

export interface DeliverymanResponse {
    id: string,
    name: string,
    phoneNumber: string,
    token: string,
    status: string,
    position: GpsPoint,
}
