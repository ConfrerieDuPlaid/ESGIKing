import {Request, Response} from "express";
import {ErrorResponse} from "../utils";

export class DefaultController {
    async sendResponse (req: Request, res: Response, callback: Function, expectedStatus: number = 200) {
        try {
            const response = await callback(req.body)
            res.json(response)
            res.status(expectedStatus).end()
        } catch (e: unknown) {
            const err = e as ErrorResponse
            console.log(err.message)
            if (err.status === undefined) err.status = 400
            res.status(err.status).end()
        }
    }
}