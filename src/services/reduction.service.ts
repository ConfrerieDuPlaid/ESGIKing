import {ReductionDocument, ReductionModel, ReductionProps} from "../models/reduction.model";
import {ErrorResponse} from "../utils";

export class ReductionService{

    private static instance: ReductionService

    public static getInstance (): ReductionService {
        if (ReductionService.instance === undefined) {
            ReductionService.instance = new ReductionService()
        }
        return ReductionService.instance
    }

    async createReduction(reduction: Partial<ReductionProps>) {
        if(!reduction.name || !reduction.amount){
            throw new ErrorResponse("Wrong name or price", 400)
        }

        const newReductionModel = new ReductionModel({
            name: reduction.name,
            amount: reduction.amount
        })
        newReductionModel.save();
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