import {RestaurantDocument, RestaurantModel, RestaurantProps, UserDocument, UserModel} from "../models";
import {ErrorResponse} from "../utils";
import {Roles} from "../utils/roles"
import {UserService} from "./user.service"

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

    public async getOneRestaurant (restaurantID: string): Promise<RestaurantDocument | null> {
        return await RestaurantModel.findById(restaurantID).exec();
    }

    public async getAllRestaurants (): Promise<RestaurantDocument[] | null> {
        return await RestaurantModel.find()
    }

    public async deleteRestaurant (restaurantID: string): Promise<boolean> {
        const res = await RestaurantModel.deleteOne({
            _id: restaurantID
        }).exec()
        return res.deletedCount === 1
    }

    public async updateAdmin (restaurantID: string, adminID: string): Promise<boolean> {
        const newAdmin: UserDocument = await UserModel.findById(adminID).exec()
        const restaurant: RestaurantDocument = await RestaurantModel.findById(restaurantID).exec()
        const previousAdmin: UserDocument = await UserModel.findById(restaurant.admin).exec()

        if (newAdmin.role !== Roles.toString(Roles.Admin)) {
            throw new ErrorResponse("This user is not an admin", 400)
        }
        if (await UserService.getInstance().userIsAssignedToRestaurant(adminID)) {
            throw new ErrorResponse("This admin is already managing a restaurant", 400)
        }

        restaurant.admin = adminID
        newAdmin.restaurant = restaurantID
        if (previousAdmin !== null) {
            previousAdmin.set("restaurant", null)
            await previousAdmin.save()
        }

        await restaurant.save()
        await newAdmin.save()
        return true
    }
}