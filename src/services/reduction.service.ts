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
}