import {DefaultController} from "./default.controller";
import express, {Request, Response, Router} from "express";
import {ReductionService} from "../services/reduction.service";
import {ErrorResponse, getAuthorization} from "../utils";
import {AuthService} from "../services";
import {Roles} from "../utils/roles";

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

    /**
     * Method : PUT
     * URL : /reduction
     * Permissions required : Admin
     *
     * @param req HTTP request object with JSON object
     * {
     *     "name" : "{{reduction name}}",
     *     "amount" : {{reduction amount}}
     * }
     * @param res HTTP response object
     *
     * @returns ReductionDocument or 500 error
     */
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

    /**
     * Method : GET
     * URL : /reduction
     * Permissions required : Admin
     *
     * @param req HTTP request object
     * @param res HTTP response object
     *
     * @returns ReductionDocument array or 500 error
     */
    async getAllReduction(req : Request, res: Response){
        await super.sendResponse(req, res, async () => {
            await AuthService.getInstance().verifyPermissions(req, Roles.Admin)
            return await this.reductionService.getAllReduction();
        }, 201);
    }

    /**
     * Method : GET
     * URL : /reduction/:reductionId
     * Permissions required : Admin
     *
     * @param req HTTP request object
     * @param res HTTP response object
     *
     * @returns ReductionDocument or 500 error
     */
    async getReductionById(req : Request, res: Response){
        await super.sendResponse(req, res, async () => {
            await AuthService.getInstance().verifyPermissions(req, Roles.Admin)
            return await this.reductionService.getReductionById(req.params.reductionId);
        }, 201);
    }

    /**
     * Method : DELETE
     * URL : /reduction/:reductionId
     * Permissions required : Admin
     *
     * @param req HTTP request object
     * @param res HTTP response object
     *
     * @returns void or 400 error
     */
    async deleteReduction(req: Request, res: Response){
        await super.sendResponse(req, res, async () => {
            return await this.reductionService.deleteReduction(req.params.reductionId);;
        }, 204);
    }

    /**
     * Method : PATCH
     * URL : /reduction/:reductionId
     * Permissions required : Admin
     *
     * @param req HTTP request object with JSON object
     * {
     *     "name" : "{{reduction name}}",
     *     "amount" : {{reduction amount}},
     *     "status": {{status}}
     * }
     * @param res HTTP response object
     *
     * @returns ReductionDocument or 500 error
     */
    async updateReduction(req: Request, res: Response){
        await super.sendResponse(req, res, async () => {
            return await this.reductionService.updateReduction(req.params.reductionId, req.body);
        }, 204);
    }
}
