import {DefaultController} from "../index";
const fileUpload = require('express-fileupload');
import express, {Request, Response, Router} from "express";
import {DeliverymanResponseAdapter} from "./deliveryman.response.adapter";
import {Deliveryman} from "../../services/deliverymen/domain/deliveryman";
import {DeliverymenService} from "../../services/deliverymen/deliverymen.service";
import {DeliverymenStatus, getDeliverymanStatusFromString} from "../../services/deliverymen/domain/deliverymen.status";
import path from "path";
import {ManagedUpload} from "aws-sdk/lib/s3/managed_upload";
import SendData = ManagedUpload.SendData;
import {int} from "aws-sdk/clients/datapipeline";

const AWS = require("aws-sdk");

const multer = require('multer');

const upload = multer({
    limits: {
        fileSize: 4 * 1024 * 1024,
    }
});

export class DeliverymenController extends DefaultController {
    private readonly deliverymenService: DeliverymenService = DeliverymenService.getInstance();

    buildRoutes(): Router {
        const router = express.Router()
        router.get('/', this.getAllDeliverymen.bind(this));
        router.post('/', express.json(), this.addDeliveryman.bind(this));
        router.post('/upload', upload.single('image'), this.addImage.bind(this))
        router.put('/activate', express.json(), this.activate.bind(this))
        return router;
    }

    async getAllDeliverymen(req: Request, res: Response) {
        await super.sendResponse(req, res, async () => {
            const deliverymen: Deliveryman[] = await this.deliverymenService
                .getAll({
                    status: getDeliverymanStatusFromString(req.query.status?.toString() || "")
                });
            return deliverymen.map(deliveryman => DeliverymanResponseAdapter.adapt(deliveryman));
        });
    }

    async activate(req: Request, res: Response) {
        await super.sendResponse(req, res, async () => {
            await this.deliverymenService.activate(req.body.id, req.body.token);
        });
    }

    async addDeliveryman(req: Request, res: Response) {
        const token: number = Math.floor((Math.random() * 999999));
        await super.sendResponse(req, res, async () => {
            await this.deliverymenService.registerDeliveryman({
                name: req.body.name,
                phoneNumber: req.body.phoneNumber,
                token: token.toString(),
                position: req.body.position,
                status: DeliverymenStatus.available
            }, req.body.password);
        }, 201);
    }

    async addImage(req: Request, res: Response) {
        // @ts-ignore
        const image = req.file

        const s3 = new AWS.S3()

        const filename = image.originalName

        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `${filename}`,
            Body: image.buffer
        }

        await s3.upload(params, (err: Error, data: SendData) => {
            if (err) {
                console.log(err)
            }
        })

        return res.send(200);
    }
}
