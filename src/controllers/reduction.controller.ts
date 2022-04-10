import {DefaultController} from "./default.controller";
import express, {Request, Response, Router} from "express";
import {ReductionService} from "../services/reduction.service";

export class ReductionController extends DefaultController{


    private readonly reductionService: ReductionService = ReductionService.getInstance();

    buildRoutes (): Router {
        const router = express.Router()
        router.put('/', express.json(), this.createReduction.bind(this))
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
}