import mongoose, {Document, Schema} from "mongoose";

const userSchema = new Schema({
    login: {
        type: Schema.Types.String,
        required: true,
        unique: true
    },
    password: {
        type: Schema.Types.String,
        required: true
    },
    sessions: [{
        type: Schema.Types.ObjectId,
        ref: "Session"
    }],
    role: {
        type: Schema.Types.String,
        enum: ["BigBoss", "Admin", "Customer", "OrderPicker", "DeliveryMan"],
        default: "Customer",
        required: true
    }

}, {
    collection: "users",
    timestamps: true,
    versionKey: false
})

export interface UserProps {
    _id: string
    login: string
    password: string
    sessions: string[]
    role: string
}

export type UserDocument = UserProps & Document

export const UserModel = mongoose.model("User", userSchema)