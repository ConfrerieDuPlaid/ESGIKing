import {DefaultController} from "./default.controller";
import express, {Request, Response, Router} from "express";
import {ReductionService} from "../services/reduction.service";

export class ReductionController extends DefaultController{


    private readonly reductionService: ReductionService = ReductionService.getInstance();

    buildRoutes (): Router {
        const router = express.Router()
        router.put('/', express.json(), this.createReduction.bind(this))
        router.get('/', express.json(), this.getAllReduction.bind(this))
        router.get('/:reductionId', express.json(), this.getReductionById.bind(this))
        router.delete('/:reductionId', express.json(), this.deleteReduction.bind(this))
        return router
    }


    async createReduction(req : Request, res: Response) {
        await super.sendResponse(req, res, async () => {
            await this.reductionService.createReduction({
                    name: req.body.name,
                    amount: +req.body.amount
                }
            );
        }, 201);
    }

    async getAllReduction(req : Request, res: Response){
        await super.sendResponse(req, res, async () => {
            return await this.reductionService.getAllReduction();
        }, 201);
    }

    async getReductionById(req : Request, res: Response){
        await super.sendResponse(req, res, async () => {
            return await this.reductionService.getReductionById(req.params.reductionId);
        }, 201);
    }

    async deleteReduction(req: Request, res: Response){
        await super.sendResponse(req, res, async () => {
            return await this.reductionService.deleteReduction(req.params.reductionId);;
        }, 204);
    }
}