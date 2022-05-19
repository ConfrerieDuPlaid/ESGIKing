import {ReductionModel, ReductionProps} from "../models/reduction.model";
import {ErrorResponse} from "../utils";
import {RestaurantModel, StaffModel, UserModel} from "../models";
import {RestaurantService} from "./restaurant.service";

export class ReductionService{

    private static instance: ReductionService

    public static getInstance (): ReductionService {
        if (ReductionService.instance === undefined) {
            ReductionService.instance = new ReductionService()
        }
        return ReductionService.instance
    }

    async createReduction(reduction: Partial<ReductionProps>, authToken: string): Promise<boolean> {

        const isProductInRestaurant = await RestaurantModel.findOne({
            _id: reduction.restaurant,
            products: reduction.product
        })

        if(!isProductInRestaurant){
            return false;
        }

        const isAdmin = await RestaurantService.getInstance().verifyStaffRestaurant(reduction.restaurant!, authToken)

        if(!isAdmin){
            throw new ErrorResponse("You're not the admin", 401)
        }

        if(!reduction.name || !reduction.amount){
            throw new ErrorResponse("Wrong name or price", 400)
        }

        const existingReduction = await ReductionModel.findOne({
            restaurant: reduction.restaurant,
            product: reduction.product,
            amount: reduction.amount,
            status: "active"
        })

        if(existingReduction){
            throw new ErrorResponse("this reduction already exist", 400);
        }

        const newReductionModel = new ReductionModel({
            name: reduction.name,
            restaurant: reduction.restaurant,
            product: reduction.product,
            amount: reduction.amount,
            status: "active",
        })
        newReductionModel.save();
        return true;
    }

    async getAllReduction() {
        return await ReductionModel.find();
    }

    async getReductionById(reductionId: string) {
        return await ReductionModel.findById(reductionId).exec();
    }

    async deleteReduction(reductionId: any) {
        await ReductionModel.deleteOne({
            _id: reductionId
        })
    }

    async updateReduction(reductionId: string, reductionBody: Partial<ReductionProps>) {
        const reduction = await this.getReductionById(reductionId)
        if(!reduction){
            throw new ErrorResponse("Wrong ID of reduction", 400)
        }
        if(reductionBody.name){
            reduction.name = reductionBody.name
        }
        if(reductionBody.amount){
            reduction.amount = reductionBody.amount
        }
        if(reductionBody.status && (reductionBody.status! == "deactivated" || reductionBody.status! == "active")){
            reduction.status =  reductionBody.status
        }

        reduction.save()
    }
}