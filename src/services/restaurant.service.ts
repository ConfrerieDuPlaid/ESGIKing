import {RestaurantDocument, RestaurantModel, RestaurantProps, StaffDocument, UserDocument, UserModel} from "../models";
import {ErrorResponse} from "../utils";
import {Roles} from "../utils/roles"
import {UserService} from "./user.service"
import {StaffModel} from "../models/staff.model";
import {AuthService} from "./auth.service";

type RestaurantWithoutId = Partial<RestaurantProps>
type RestaurantPartial = Partial<RestaurantProps>

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

    public async updateRestaurant (restaurantID: string, restaurantData: RestaurantPartial): Promise<boolean> {
        const restaurant: RestaurantDocument = await RestaurantModel.findById(restaurantID).exec()
        if (restaurant === null) return false
        if (!!restaurantData.name) restaurant.name = restaurantData.name
        if (!!restaurantData.address) restaurant.address = restaurantData.address
        return await restaurant.save() !== null
    }


    async addAProductInRestaurant(restaurantID: string, productID: string, authToken: string): Promise<boolean> {
        const restaurant: RestaurantDocument | null = await RestaurantService.getInstance().getOneRestaurant(restaurantID)
        if(!restaurant){
            return false;
        }
        const staff = await StaffModel.findOne({
            restaurantID: restaurantID
        }).exec()

        const currentUser = await UserModel.findOne({
            sessions: authToken
        }).exec()

        if(currentUser._id.toString() != staff.userID.toString()){
            return false;
        }

        //vérifier si le produit existe (à faire quand théo aura fait find on product)

        if(productID) {
            if (restaurant?.products){
                restaurant?.products!.push(productID)
            }else{
                restaurant!.products = [productID]
            }
        }
        return await restaurant.save() !== null
    }
}