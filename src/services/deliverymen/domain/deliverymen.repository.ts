import {Deliveryman, DeliverymanWithoutId} from "./deliveryman";

export interface DeliverymenRepository {
    getAllByStatus(status?: string):Promise<Deliveryman[]>;
    create(deliveryman: DeliverymanWithoutId): Promise<Deliveryman>;
}
