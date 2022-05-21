import {Deliveryman, DeliverymanWithoutId} from "./domain/deliveryman";
import {DeliverymenRepository} from "./domain/deliverymen.repository";
import {DeliverymenModule} from "./deliverymen.module";
import {ErrorResponse} from "../../utils";
import {DeliverymenStatus, getDeliverymanStatusFromString} from "./domain/deliverymen.status";
import {RestaurantDocument, RestaurantModel} from "../../models";
import {GpsPoint} from "../../utils/gps.point";

export class DeliverymenService {
    private static instance: DeliverymenService;
    private readonly repository: DeliverymenRepository = DeliverymenModule.repository();

    public static getInstance (): DeliverymenService {
        if (DeliverymenService.instance === undefined) {
            DeliverymenService.instance = new DeliverymenService()
        }
        return DeliverymenService.instance
    }

    async getAllDeliverymenByStatusAndClosestToRestaurant(props: {
        status?: string,
        restaurant?: string
    }): Promise<Deliveryman[]> {
        let deliverymen = await this.repository.getAll();
        if(props.status) {
            DeliverymenService.checkStringDeliverymanStatus(props.status)
            deliverymen = deliverymen.filter(deliveryman => deliveryman.status === props.status)
        }
        if(props.restaurant) {
            const restaurant: RestaurantDocument = await RestaurantModel.findById(props.restaurant).exec();
            if(!restaurant) throw new ErrorResponse(`Restaurant ${props.restaurant} not found.`,404);
            deliverymen = [DeliverymenService.getNearestDeliverymanFromTheRestaurant(deliverymen, restaurant.location)];
        }
        return deliverymen;
    }

    private static getNearestDeliverymanFromTheRestaurant(
        deliverymen: Deliveryman[],
        restaurant: GpsPoint
    ) {
        return deliverymen
            .reduce((prev, cur) => {
                const currentIsTheNearest = cur.position.distanceTo(restaurant) < prev.position.distanceTo(restaurant);
                return currentIsTheNearest
                    ? cur
                    : prev
            });
    }

    private static checkStringDeliverymanStatus(status: string): void {
        try {
            getDeliverymanStatusFromString(status);
        } catch (e) {
            throw new ErrorResponse("Bad deliveryman status " + status, 400);
        }
    }

    async registerDeliveryman(dto: DeliverymanWithoutId): Promise<Deliveryman> {
        if(!dto.name) {
            throw new ErrorResponse('Deliveryman\'s name missing', 400);
        }
        return await this.repository.create(Deliveryman.withoutId({
            name: dto.name,
            position: dto.position,
            status: DeliverymenStatus.available
        }))
    }
}
