import mongoose, {Document, Schema} from "mongoose";

const OrderSchema = new Schema({
    restaurant: {
        type: Schema.Types.ObjectId,
        ref: "restaurants",
        required: true,
    },
    products: [{
        type: Schema.Types.ObjectId,
        ref: "products",
        required: true,
    }],
    menus: [{
        type: Schema.Types.ObjectId,
        ref: "menu",
        required: false,
    }],
    amount: {
        type: Schema.Types.Number,
        required: true
    },
    status: {
        type: Schema.Types.String,
        required: true
    },
    reduction: {
        type: Schema.Types.ObjectId,
        ref: "reductions",
        required: false,
    },
    customer: {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: false,
    },
    deliverymanId: {
        type: Schema.Types.ObjectId,
        ref: "deliverymen",
        required: false
    },
    address: {
        type: Schema.Types.String,
        required: false
    }
}, {
    collection: "orders",
    timestamps: true,
    versionKey: false
})

export interface OrderProps {
    _id: string
    restaurant: string;
    products: string[];
    menus?: string[];
    amount: number;
    status: string;
    reductionId?: string;
    customer?: string;
    deliverymanId?: string
    address?: string;
}

export type OrderDocument = OrderProps & Document

export const OrderModel = mongoose.model("Order", OrderSchema)
