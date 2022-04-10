import {RestaurantDocument, RestaurantModel, StaffDocument, StaffModel, StaffProps} from "../models";
import {UserService} from "./user.service";
import {Roles} from "../utils/roles";
import {ErrorResponse} from "../utils";

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
            await previousAdmin.delete()
        }
        return true
    }

    public async addStaff (staffProps: StaffPartial): Promise<StaffDocument> {
        const restaurant: RestaurantDocument = await RestaurantModel.findById(staffProps.restaurantID).exec()
        if (restaurant === null) {
            throw new ErrorResponse("This restaurant doesn't exist", 404)
        }
        if (await this.userIsAssignedToRestaurant(staffProps.staffID)) {
            throw new ErrorResponse("This user is already assigned to a restaurant", 409)
        }

        if (!await UserService.getInstance().validUserRole(
            staffProps.staffID,
            [Roles.toString(Roles.Admin), Roles.toString(Roles.OrderPicker)])) {
            throw new ErrorResponse("Invalid user role", 400)
        }
        if (!!staffProps.role) {
            if (staffProps.role === "Admin") {
                if (await UserService.getInstance().getUserProp(staffProps.staffID, "role") !== Roles.toString(Roles.Admin)) {
                    throw new ErrorResponse("This user is not an admin", 400)
                }
                await this.removeAdmin(staffProps.restaurantID)
            }
        }
        const newStaff = new StaffModel({
            staffID: staffProps.staffID,
            restaurantID: staffProps.restaurantID,
            role: !!staffProps.role ? staffProps.role : "OrderPicker"
        })
        return newStaff.save()
    }

    public async deleteStaff (staffProps: StaffPartial): Promise<boolean> {
        const res = await StaffModel.deleteOne({
            restaurantID: staffProps.restaurantID,
            staffID: staffProps.staffID
        }).exec()
        return res.deletedCount === 1
    }

    public async userIsAssignedToRestaurant (userID: string | undefined): Promise<boolean> {
        const staff = await StaffModel.findOne({
            staffID: userID
        }).exec()
        if (!(!!staff)) return false
        return !!staff.restaurantID
    }
}