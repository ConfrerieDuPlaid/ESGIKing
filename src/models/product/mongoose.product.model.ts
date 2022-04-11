import mongoose, {Document, Schema} from "mongoose";

const productSchema = new Schema({
    name: {
        type: Schema.Types.String,
        required: true,
        unique: true
    },
    price: {
        type: Schema.Types.Number,
        required: true
    },
    reduction: {
        type: Schema.Types.ObjectId,
        required: false,
        ref: "Reduction"
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
    reduction?: string;
}

export type ProductDocument = MongooseProductProps & Document;
export const ProductModel = mongoose.model("Product", productSchema);