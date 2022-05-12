import mongoose, {Document, Schema} from "mongoose";

const MenuSchema = new Schema({
    name: {
        type: Schema.Types.String,
        required: true,
    },
    restaurant: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    products: [{
        type: Schema.Types.ObjectId,
        required: true,
    }],
    amount: {
        type: Schema.Types.Number,
        required: true
    },
    status: {
        type: Schema.Types.String,
        required: true
    },
    spotlight: {
        type: Schema.Types.Boolean,
        default: false
    }
}, {
    collection: "menu",
    timestamps: true,
    versionKey: false
})

export interface MenuProps {
    _id: string
    name: string
    restaurant: string;
    products: string[];
    amount: number;
    status: string;
    spotlight: boolean;
}

export type MenuDocument = MenuProps & Document

export const MenuModel = mongoose.model("Menu", MenuSchema)