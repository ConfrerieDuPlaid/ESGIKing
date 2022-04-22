import {ReductionModel, ReductionProps} from "../models/reduction.model";
import {ErrorResponse} from "../utils";
import {RestaurantModel, StaffModel, UserModel} from "../models";

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
            console.log(isProductInRestaurant)
            return false;
        }

        const staff = await StaffModel.findOne({
            restaurantID: reduction.restaurant
        }).exec()

        const currentUser = await UserModel.findOne({
            sessions: authToken
        }).exec()

        if(currentUser._id.toString() != staff.userID.toString()){
            return false;
        }

        if(!reduction.name || !reduction.amount){
            throw new ErrorResponse("Wrong name or price", 400)
        }

        const newReductionModel = new ReductionModel({
            name: reduction.name,
            restaurant: reduction.restaurant,
            product: reduction.product,
            amount: reduction.amount
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
        reduction.save()
    }
}