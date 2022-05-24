import mongoose, {Document, Schema} from "mongoose";

const chatSchema = new Schema({
    order: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Order"
    },
    sender: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Users"
    },
    message: {
        type: Schema.Types.String,
        required: true
    },
    date: {
        type: Schema.Types.Date,
        required: true
    }

}, {
    collection: "chat",
    timestamps: true,
    versionKey: false
})

export interface ChatProps {
    _id: string
    order: string
    sender: string
    message: string
    date: Date
}

export type ChatDocument = ChatProps & Document

export const ChatModel = mongoose.model("Chat", chatSchema)