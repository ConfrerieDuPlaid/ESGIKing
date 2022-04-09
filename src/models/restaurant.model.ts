import mongoose, {Schema, Document} from "mongoose";

const restaurantSchema = new Schema({
    name: {
        type: Schema.Types.String,
        required: true
    },
    admin: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    address: {
        type: Schema.Types.String,
        required: true,
        unique: true
    },
    employees: [{
        type: Schema.Types.ObjectId,
        ref: "User"
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
    admin: string
    address: string
    employees: string[]
}

export type RestaurantDocument = RestaurantProps & Document

export const RestaurantModel = mongoose.model("Restaurant", restaurantSchema)