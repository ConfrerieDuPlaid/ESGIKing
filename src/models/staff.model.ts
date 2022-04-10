import mongoose, {Document, Schema} from "mongoose";

const staffSchema = new Schema({
    staffID: {
        type: Schema.Types.ObjectId,
        required: true,
        unique: true,
        ref: "User"
    },
    restaurantID: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Restaurant"
    },
    role: {
        type: Schema.Types.String,
        enum: ["Admin", "OrderPicker"],
        default: "OrderPicker",
        required: true
    }
}, {
    collection: "staff",
    timestamps: true,
    versionKey: false
})

export interface StaffProps {
    _id: string
    login: string
    password: string
    sessions: string[]
    role: string
    restaurant: string
}

export type StaffDocument = StaffProps & Document

export const StaffModel = mongoose.model("Staff", staffSchema)