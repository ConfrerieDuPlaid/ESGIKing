import {Deliveryman, DeliverymanWithoutId} from "./domain/deliveryman";
import {DeliverymenRepository} from "./domain/deliverymen.repository";
import {DeliverymenModule} from "./deliverymen.module";
import {ErrorResponse} from "../../utils";
import {getDeliverymanStatusFromString} from "./domain/deliverymen.status";

export class DeliverymenService {
    private static instance: DeliverymenService;
    private readonly repository: DeliverymenRepository = DeliverymenModule.repository();

    public static getInstance (): DeliverymenService {
        if (DeliverymenService.instance === undefined) {
            DeliverymenService.instance = new DeliverymenService()
        }
        return DeliverymenService.instance
    }

    async getAllDeliverymen(status?: string): Promise<Deliveryman[]> {
        if(status) DeliverymenService.checkStringDeliverymanStatus(status)
        return await this.repository.getAllByStatus(status);
    }

    private static checkStringDeliverymanStatus(status: string): void {
        getDeliverymanStatusFromString(status);
    }

    async registerDeliveryman(dto: DeliverymanWithoutId): Promise<Deliveryman> {
        if(!dto.name) {
            throw new ErrorResponse('Deliveryman\'s name missing', 400);
        }
        return await this.repository.create(Deliveryman.withoutId({
            name: dto.name,
            position: dto.position,
            status: dto.status
        }))
    }
}
