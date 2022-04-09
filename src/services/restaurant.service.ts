import {RestaurantDocument, RestaurantModel, RestaurantProps, UserProps} from "../models";
import {ErrorResponse} from "../utils";

type RestaurantWithoutId = Partial<RestaurantProps>

export class RestaurantService {

    private static instance: RestaurantService

    public static getInstance (): RestaurantService {
        if (RestaurantService.instance === undefined) {
            RestaurantService.instance = new RestaurantService()
        }
        return RestaurantService.instance
    }

    private constructor() { }

    public async createRestaurant (restaurant: RestaurantWithoutId): Promise<RestaurantDocument> {
        if (!restaurant.name) {
            throw new ErrorResponse("You have to specify a name for the restaurant", 400)
        }
        if (!restaurant.address) {
            throw new ErrorResponse("You have to specify an address for the restaurant", 400)
        }

        const model = new RestaurantModel({
            name: restaurant.name,
            address: restaurant.address
        })

        return model.save()
    }
}