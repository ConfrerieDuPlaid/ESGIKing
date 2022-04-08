import mongoose, {Schema, Document} from "mongoose";

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
    }]

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
}

export type UserDocument = UserProps & Document

export const UserModel = mongoose.model("User", userSchema)