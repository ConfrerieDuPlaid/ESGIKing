import {Deliveryman, DeliverymanWithoutId} from "./domain/deliveryman";
import {DeliverymenRepository} from "./domain/deliverymen.repository";
import {DeliverymenModule} from "./deliverymen.module";
import {ErrorResponse} from "../../utils";
import {DeliverymenStatus} from "./domain/deliverymen.status";
import {GpsPoint} from "../../utils/gps.point";
import {RestaurantService} from "../restaurant.service";

export class DeliverymenService {
    private static instance: DeliverymenService;
    private readonly repository: DeliverymenRepository = DeliverymenModule.repository();
    private readonly restaurantService: RestaurantService = RestaurantService.getInstance();

    public static getInstance (): DeliverymenService {
        if (DeliverymenService.instance === undefined) {
            DeliverymenService.instance = new DeliverymenService()
        }
        return DeliverymenService.instance
    }

    async getAllDeliverymenByStatus(status: DeliverymenStatus): Promise<Deliveryman[]> {
        const deliverymen = await this.repository.getAll();
        return deliverymen.filter(deliveryman => deliveryman.status === status);
    }

    async getAll(props: {
        status?: DeliverymenStatus
    }): Promise<Deliveryman[]> {
        let deliverymen = await this.repository.getAll();
        if(props.status)
            deliverymen = deliverymen.filter(deliveryman => deliveryman.status === props.status)
        return deliverymen;
    }

    public async getNearestAvailableDeliverymanFromTheRestaurant(restaurantId: string) {
        const restaurant = await this.restaurantService.getOneRestaurant(restaurantId);
        if(!restaurant?.location) {
            throw new ErrorResponse(`Restaurant ${restaurantId} location not found`, 404);
        }
        const restaurantLocation = new GpsPoint(
          restaurant.location.longitude,
          restaurant.location.latitude
        );
        const deliverymen = await this.getAllDeliverymenByStatus(DeliverymenStatus.available);
        return deliverymen
            .reduce((prev, cur) => {
                const currentIsTheNearest = cur.position.distanceTo(restaurantLocation) < prev.position.distanceTo(restaurantLocation);
                return currentIsTheNearest
                    ? cur
                    : prev
            });
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

    async updateDeliverymanStatus(deliverymanId: string, newStatus: DeliverymenStatus) {
        const deliveryman = await this.repository.getById(deliverymanId);
        deliveryman.status = newStatus;
        this.repository.save(deliveryman);
    }
}
