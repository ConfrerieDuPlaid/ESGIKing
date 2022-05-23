import mongoose, {Document, Schema} from "mongoose";
import {GpsPoint} from "../../utils/gps.point";

const deliverymanSchema = new Schema({
    name: {
        type: Schema.Types.String,
        required: true
    },
    position: {
        type: Schema.Types.Mixed,
        required: false
    },
    status: {
        type: Schema.Types.String,
        required: false
    }
}, {
    collection: 'deliverymen',
    timestamps: true,
    versionKey: false
})

export interface MongooseDeliverymanProps {
    _id: string;
    name: string;
    position: GpsPoint;
    status: string;
}

export type DeliverymanDocument = MongooseDeliverymanProps & Document;
export const DeliverymanModel = mongoose.model("Deliveryman", deliverymanSchema);
