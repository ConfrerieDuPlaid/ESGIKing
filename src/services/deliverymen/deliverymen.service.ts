import {Deliveryman, DeliverymanWithoutId} from "./domain/deliveryman";
import {DeliverymenRepository} from "./domain/deliverymen.repository";
import {DeliverymenModule} from "./deliverymen.module";
import {ErrorResponse} from "../../utils";
import {DeliverymenStatus} from "./domain/deliverymen.status";
import {GpsPoint} from "../../utils/gps.point";
import {RestaurantService} from "../restaurant.service";
import {AuthService} from "../auth.service";
import {Roles} from "../../utils/roles";
import {AWSError} from "aws-sdk";
import {GetItemOutput, PutItemOutput} from "aws-sdk/clients/dynamodb";
const AWS = require("aws-sdk");
import {config} from "dotenv";
import {DeliverymanId} from "./domain/deliveryman.id";

config()
export class DeliverymenService {
    private static instance: DeliverymenService;
    private readonly repository: DeliverymenRepository = DeliverymenModule.repository();
    private readonly restaurantService: RestaurantService = RestaurantService.getInstance();

    public static getInstance (): DeliverymenService {
        if (DeliverymenService.instance === undefined) {
            DeliverymenService.instance = new DeliverymenService()
        }
        return DeliverymenService.instance
    }

    async getAllDeliverymenByStatus(status: DeliverymenStatus): Promise<Deliveryman[]> {
        const deliverymen = await this.repository.getAll();
        return deliverymen.filter(deliveryman => deliveryman.status === status);
    }

    async getAll(props: {
        status?: DeliverymenStatus
    }): Promise<Deliveryman[]> {
        AWS.config.update({
            region: "eu-west-1",
        });
        const docClient = new AWS.DynamoDB.DocumentClient();

        const params = {
            TableName: "user",
        };
        let deliverymen: any;
        let returnData: Deliveryman[] = [];
        deliverymen = await docClient.scan(params).promise();
        deliverymen = deliverymen.Items

        // @ts-ignore
        deliverymen.forEach(deliveryman => {
            if(deliveryman.dto && props.status == deliveryman.dto.status){
                const res: Deliveryman = new Deliveryman({
                    id: new DeliverymanId(deliveryman._id),
                    name: deliveryman.dto.name,
                    position: new GpsPoint(deliveryman.dto.position.longitude, deliveryman.dto.position.latitude),
                    status: deliveryman.dto.status
                })
                returnData.push(res);
            }
        })
        return returnData;

    }

    public async getNearestAvailableDeliverymanFromTheRestaurant(restaurantId: string) {
        const restaurant = await this.restaurantService.getOneRestaurant(restaurantId);
        if(!restaurant?.location) {
            throw new ErrorResponse(`Restaurant ${restaurantId} location not found`, 404);
        }
        const restaurantLocation = new GpsPoint(
          restaurant.location.longitude,
          restaurant.location.latitude
        );
        const deliverymen = await this.getAllDeliverymenByStatus(DeliverymenStatus.available);
        if (deliverymen) return deliverymen
            .reduce((prev, cur) => {
                const currentIsTheNearest = cur.position.distanceTo(restaurantLocation) < prev.position.distanceTo(restaurantLocation);
                return currentIsTheNearest
                    ? cur
                    : prev
            });
        else return
    }

    async registerDeliveryman(dto: DeliverymanWithoutId, password: string){
        if(!dto.name) {
            throw new ErrorResponse('Deliveryman\'s name missing', 400);
        }

        AWS.config.update({
            region: "eu-west-1",
        });
        const docClient = new AWS.DynamoDB.DocumentClient();

        const params = {
            TableName: "user",
            Item: {
                "_id": "z84f3a6ez5f43",
                dto
            }
        };

        docClient.put(params, function(err: AWSError, data: PutItemOutput) {
            if (err) {
                console.error( JSON.stringify(err, null, 2));
            } else {
                console.log("PutItem succeeded:" + params.Item.dto.name);
            }
        });
    }

    async updateDeliverymanStatus(deliverymanId: string, newStatus: DeliverymenStatus) {
        const deliveryman = await this.repository.getById(deliverymanId);
        deliveryman.status = newStatus;
        this.repository.save(deliveryman);
    }
}
