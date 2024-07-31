import express from "express";
import Chat from "../models/chatModel.js";
import Message from "../models/messageModel.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router= express.Router();

router.post("/newmessage" , async(req,res) => {
    try{
            //store the message in the database
            const newMessage = new Message(req.body);
            const savedMessage = await newMessage.save();

            //update last message of chat
            await Chat.findOneAndUpdate(
                {_id: req.body.chat},
                {
                    lastMessage: savedMessage._id,
                    $inc : { unreadMessages : 1 }
                }
            );
            
            res.send({
                success: true,
                message: "Message sent successfully",
                data: savedMessage
            });

    }catch(err){
            res.send({
                success: false,
                message: "Error sending message",
                error: err.message
            });
    }
} );


router.get("/getallmessages/:chatId" , async(req,res) => {
    try{
        const messages = await Message.find({
            chat: req.params.chatId
        }).sort({ createdAt: 1 });
        res.send({
            success: true,
            message: "Messages fetched successfully",
            data: messages
        });
    }catch(err){
        res.send({
            success: false,
            message: "Error fetching messages",
            error: err.message
        });
    }
})

export default router;