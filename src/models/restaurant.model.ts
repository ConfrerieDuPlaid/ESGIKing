import mongoose, {Schema, Document} from "mongoose";

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
    products: [{
        type: Schema.Types.ObjectId,
        ref: "Product",
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
}

export type RestaurantDocument = RestaurantProps & Document

export const RestaurantModel = mongoose.model("Restaurant", restaurantSchema)