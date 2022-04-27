import {DefaultController} from "./default.controller";
import express, {Request, Response, Router} from "express";
import {ReductionService} from "../services/reduction.service";
import {ErrorResponse, getAuthorization} from "../utils";
import {AuthService} from "../services";
import {Roles} from "../utils/roles";
import {ReductionModel} from "../models/reduction.model";

export class ReductionController extends DefaultController{


    private readonly reductionService: ReductionService = ReductionService.getInstance();

    buildRoutes (): Router {
        const router = express.Router()
        router.put('/', express.json(), this.createReduction.bind(this))
        router.get('/', express.json(), this.getAllReduction.bind(this))
        router.get('/:reductionId', express.json(), this.getReductionById.bind(this))
        router.delete('/:reductionId', express.json(), this.deleteReduction.bind(this))
        router.patch('/:reductionId', express.json(), this.updateReduction.bind(this))
        return router
    }


    async createReduction(req : Request, res: Response) {
        const authToken = getAuthorization(req);
        await super.sendResponse(req, res, async () => {
            const res: boolean = await this.reductionService.createReduction({
                    name: req.body.name,
                    restaurant: req.body.restaurant,
                    product: req.body.product,
                    amount: +req.body.amount
                }, authToken
            );
            if(!res){
                throw new ErrorResponse("The reduction cannot be added to the restaurant", 500)
            }
        }, 201);
    }

    async getAllReduction(req : Request, res: Response){
        await super.sendResponse(req, res, async () => {
            await AuthService.getInstance().verifyPermissions(req, Roles.Admin)
            return await this.reductionService.getAllReduction();
        }, 201);
    }

    async getReductionById(req : Request, res: Response){
        await super.sendResponse(req, res, async () => {
            await AuthService.getInstance().verifyPermissions(req, Roles.Admin)
            return await this.reductionService.getReductionById(req.params.reductionId);
        }, 201);
    }

    async deleteReduction(req: Request, res: Response){
        await super.sendResponse(req, res, async () => {
            return await this.reductionService.deleteReduction(req.params.reductionId);;
        }, 204);
    }

    async updateReduction(req: Request, res: Response){
        await super.sendResponse(req, res, async () => {
            return await this.reductionService.updateReduction(req.params.reductionId, req.body);
        }, 204);
    }
}