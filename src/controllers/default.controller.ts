import {Request, Response} from "express";
import {ErrorResponse} from "../utils";

export class DefaultController {
    /**
     * Default controller extended by all other controllers
     * @param req HTTP request object
     * @param res HTTP response object
     * @param callback Controller callback function that will call the service
     * @param expectedStatus Expected return status
     */
    async sendResponse (req: Request, res: Response, callback: Function, expectedStatus: number = 200) {
        try {
            const response = await callback(req.body)
            res.status(expectedStatus).send(response);
        } catch (e: unknown) {
            console.log(e)
            const err = e as ErrorResponse
            if (!err.status) err.status = 400
            res.status(err.status).send(err.message);
        }
    }
}