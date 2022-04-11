import mongoose, {Document, Schema} from "mongoose";

const reductionSchema = new Schema({
    name: {
        type: Schema.Types.String,
        required: true,
        unique: true
    },
    amount: {
        type: Schema.Types.Number,
        required: true
    },

}, {
    collection: "reductions",
    timestamps: true,
    versionKey: false
})

export interface ReductionProps {
    _id: string
    name: string
    amount: number
}

export type ReductionDocument = ReductionProps & Document

export const ReductionModel = mongoose.model("Reduction", reductionSchema)