import mongoose, {Document, Schema} from "mongoose";

const sessionSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    platform: {
        type: Schema.Types.String,
        required: true
    },
    expiration: {
        type: Schema.Types.Date
    }
}, {
    collection: "sessions",
    timestamps: true,
    versionKey: false
})

export interface SessionProps {
    _id: string
    user: string
    platform: string
    expiration?: Date
}

export type SessionDocument = SessionProps & Document

export const SessionModel = mongoose.model("Session", sessionSchema)