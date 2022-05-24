import mongoose, {Document, Schema} from "mongoose";
import {GpsPoint} from "../utils/gps.point";

const restaurantSchema = new Schema({
    name: {
        type: Schema.Types.String,
        required: true
    },
    address: {
        type: Schema.Types.String,
        required: true,
        unique: true
    },
    location: {
        type: Schema.Types.Mixed,
        required: true
    },
    products: [{
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: false,

    }],
    menus: [{
        type: Schema.Types.ObjectId,
        ref: "menu",
        required: false,

    }]
    //Menus
}, {
    collection: "restaurants",
    timestamps: true,
    versionKey: false
})

export interface RestaurantProps {
    _id: string
    name: string
    address: string
    location: GpsPoint
    products?: string[]
    menus?: string[]
}

export type RestaurantDocument = RestaurantProps & Document

export const RestaurantModel = mongoose.model("Restaurant", restaurantSchema)
