import express from "express";
import Chat from "../models/chatModel.js";
import auth from "../middlewares/authMiddleware.js";
import { error } from "console";
import Message from "../models/messageModel.js";

const router= express.Router();

// Create a new chat LHS
router.post("/createnewchat", auth , async(req,res) => {
    try{
        const newChat = new Chat(req.body);
        const savedChat = await newChat.save();

        //populate members and last message in saved chat
        await savedChat.populate("members");
        res.send({
            success: true,
            message: "Chat created successfully",
            data: savedChat
        });
    }catch(err){
        res.send({
            success: false,
            message: "Error creating chat",
            error: err.message
        });
    }
});


// Get all chats of current user
router.get("/getallchats" , auth , async(req,res) => {
    try{
        const chats = await Chat.find({
            members: { $in: [req.body.userId] }
        }).populate("members").populate("lastMessage").sort({ updatedAt: -1 });
        res.send({
            success: true,
            message: "Chats fetched successfully",
            data: chats
        });
    }catch(err){
        res.send({
            success: false,
            message: "Error fetching chats",
            error: err.message
        });
    }
});


//clear all unread messages of a chat
router.post("/clearunreadmessages", auth, async(req,res) => {
    try{

        //find chat and update unread messages count to 0
        const chat = await Chat.findById(req.body.chat);
        if(!chat)
            {
                return (
                    res.send({
                        success: false,
                        message: "Chat not found"
                    })
                );
            }
        const updatedChat = await Chat.findByIdAndUpdate(
            req.body.chat,
            {
                unreadMessages: 0
            },
            { new: true}
        ).populate("members").populate("lastMessage");

        // find all unread messages of this chat and update them to read
        await Message.updateMany(
            {
                chat: req.body.chat,
                read: false
            },
            {
                read: true
            }
        );
        res.send({
            success: true,
            message: "Unread messages cleared successfully",
            data: updatedChat
        });
    }catch(err){
        res.send({
            success: false,
            message: "Error clearing unread messages",
            error: err.message
        });
    }
});

export default router;