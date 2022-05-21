import {Deliveryman, DeliverymanWithoutId} from "./deliveryman";

export interface DeliverymenRepository {
    getAll():Promise<Deliveryman[]>;
    create(deliveryman: DeliverymanWithoutId): Promise<Deliveryman>;
}
