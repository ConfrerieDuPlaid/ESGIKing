import mongoose, {Document, Schema} from "mongoose";
import exp from "constants";

const productSchema = new Schema({
    name: {
        type: Schema.Types.String,
        required: true,
        unique: true
    },
    price: {
        type: Schema.Types.Number,
        required: true
    }
}, {
    collection: 'products',
    timestamps: true,
    versionKey: false
})

export interface MongooseProductProps {
    _id: string;
    name: string;
    price: number;
}

export type ProductDocument = MongooseProductProps & Document;
export const ProductModel = mongoose.model("Product", productSchema);