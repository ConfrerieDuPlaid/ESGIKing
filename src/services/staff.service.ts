import {RestaurantDocument, StaffDocument, StaffModel, StaffProps} from "../models";
import {UserService} from "./user.service";
import {Roles} from "../utils/roles";
import {ErrorResponse} from "../utils";
import {RestaurantService} from "../services";

type StaffPartial = Partial<StaffProps>

export class StaffService {
    private static instance: StaffService

    public static getInstance(): StaffService {
        if (StaffService.instance === undefined) {
            StaffService.instance = new StaffService()
        }
        return StaffService.instance
    }

    private constructor() {
    }

    public async removeAdmin (restaurantID: string | undefined): Promise<boolean> {
        const previousAdmin: StaffDocument = await StaffModel.findOne({
            restaurantID: restaurantID,
            role: "Admin"
        }).exec()
        if (previousAdmin !== null) {
            const res = await previousAdmin.delete()
            return res.deletedCount !== 0
        }
        return true
    }

    public async addStaff (staffProps: StaffPartial): Promise<StaffDocument> {
        const restaurant: RestaurantDocument | null = await RestaurantService.getInstance().getOneRestaurant(staffProps.restaurantID!)
        if (restaurant === null) {
            throw new ErrorResponse("This restaurant doesn't exist", 404)
        }
        if (await this.userIsAssignedToRestaurant(staffProps.userID)) {
            throw new ErrorResponse("This user is already assigned to a restaurant", 409)
        }

        if (!await UserService.getInstance().validUserRole(
            staffProps.userID,
            [Roles.toString(Roles.Admin), Roles.toString(Roles.OrderPicker)])) {
            throw new ErrorResponse("Invalid user role", 400)
        }
        if (!!staffProps.role) {
            if (staffProps.role === "Admin") {
                const isAdmin: boolean = await UserService.getInstance().getUserProp(staffProps.userID, "role") === Roles.toString(Roles.Admin)
                if (!isAdmin) {
                    throw new ErrorResponse("This user is not an admin", 400)
                }
                if (!await this.removeAdmin(staffProps.restaurantID)) {
                    throw new ErrorResponse("An error has occurred removing the previous admin", 500)
                }
            }
        }
        const newStaff = new StaffModel({
            userID: staffProps.userID,
            restaurantID: staffProps.restaurantID,
            role: !!staffProps.role ? staffProps.role : "OrderPicker"
        })
        return newStaff.save()
    }

    public async deleteStaff (staffProps: StaffPartial): Promise<boolean> {
        const res = await StaffModel.deleteOne({
            restaurantID: staffProps.restaurantID,
            userID: staffProps.userID
        }).exec()
        return res.deletedCount !== 0
    }

    public async userIsAssignedToRestaurant (userID: string | undefined): Promise<boolean> {
        const staff = await StaffModel.findOne({
            userID: userID
        }).exec()
        if (!staff) return false
        return !!staff.restaurantID
    }

    public async getStaff (ressourceID: string, ressourceType: string): Promise<StaffDocument[]> {
        const orProperties = []
        if (ressourceType === "restaurant" || ressourceType === "") {
            orProperties.push({restaurantID: ressourceID})
        }
        if (ressourceType === "staff" || ressourceType === "") {
            orProperties.push({userID: ressourceID})
        }
        return await StaffModel.find({$or: orProperties}).exec()
    }

    public async getAllStaff (): Promise<StaffDocument[] | null> {
        return await StaffModel.find()
    }
}