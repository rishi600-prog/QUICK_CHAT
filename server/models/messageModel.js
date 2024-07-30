import mongoose from "mongoose";

const messageData = new mongoose.Schema({
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "chats"
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    text: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    }
} , {
    timestamps: true
});

const Message = mongoose.model("messages", messageData);

export default Message;