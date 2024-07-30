import mongoose from "mongoose";

const chatData = new mongoose.Schema(
    {
        members: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "users"
                }
            ]
        },
        lastMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "messages"
        },
        unreadMessages: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("chats", chatData);