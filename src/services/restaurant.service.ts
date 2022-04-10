import {RestaurantDocument, RestaurantModel, RestaurantProps, StaffDocument, UserDocument, UserModel} from "../models";
import {ErrorResponse} from "../utils";
import {Roles} from "../utils/roles"
import {UserService} from "./user.service"
import {StaffModel} from "../models/staff.model";

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
        const newAdmin: UserDocument = await UserService.getInstance().getUser(adminID)
        if (newAdmin.role !== Roles.toString(Roles.Admin)) {
            throw new ErrorResponse("This user is not an admin", 400)
        }
        if (await UserService.getInstance().userIsAssignedToRestaurant(adminID)) {
            throw new ErrorResponse("This admin is already managing a restaurant", 409)
        }

        const restaurant: RestaurantDocument = await RestaurantModel.findById(restaurantID).exec()
        if (restaurant === null) {
            throw new ErrorResponse("This restaurant doesn't exist", 404)
        }

        await this.removeAdmin(restaurantID)
        const newStaff = new StaffModel({
            staffID: adminID,
            restaurantID: restaurantID,
            role: "Admin"
        })
        console.log(newStaff)
        await newStaff.save()
        console.log("Back")

        restaurant.admin = adminID
        await restaurant.save()

        return true
    }

    public async removeAdmin (restaurantID: string): Promise<boolean> {
        const previousAdmin: StaffDocument = await StaffModel.findOne({
            restaurantID: restaurantID,
            role: "Admin"
        }).exec()
        if (previousAdmin !== null) {
            await previousAdmin.delete()
        }
        return true
    }

    public async addStaff (restaurantID: string, userID: string, role: string = "OrderPicker"): Promise<StaffDocument> {
        console.log(restaurantID, userID, role)
        const newStaff = new StaffModel({
            staffID: userID,
            restaurantID: restaurantID,
            role: role
        })
        console.log(newStaff)
        return newStaff.save()
    }
}