import {DefaultController} from "./default.controller";
import express, {Request, Response, Router} from "express";
import {Product} from "../services/products/domain/product";
import {ProductResponseAdapter} from "./products/product.response.adapter";
import {ReductionService} from "../services/reduction.service";

export class ReductionController extends DefaultController{


    private readonly reductionService: ReductionService = ReductionService.getInstance();

    buildRoutes (): Router {
        const router = express.Router()
        router.put('/', express.json(), this.createReduction)
        return router
    }


    async createReduction(req : Request, res: Response) {
        throw new Error("not implemented")
    }
}