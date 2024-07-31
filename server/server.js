import express from "express";
import "dotenv/config";
import dbConfig from "./config/dbConfig.js";
import usersRoute from "./routes/usersRoute.js";
import chatsRoute from "./routes/chatsRoute.js";
import messagesRoute from "./routes/messagesRoute.js";
import http from 'http';
import { Server } from 'socket.io';

const app= express();
const port= process.env.PORT || 5000;

//initialization of socket in server side
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

let onlineUsers = [];
//check the connection  of socket from client
io.on("connection", (socket) => {
    //socket events will be there
    socket.on("join-room" , (userId) => {
        socket.join(userId);    //Joining current user into a room
    });

    //send message to clients (who are present in members array)
    socket.on("send-message" , (message) => {
        io.to(message.members[0]).to(message.members[1]).emit("receive-message" , message);
    });

    //clear unread messages
    socket.on("clear-unread-messages", (data) => {
        io.to(data.members[0]).to(data.members[1]).emit("unread-messages-cleared" , data);
    });

    //typing event
    socket.on("typing", (data) => {
        io.to(data.members[0]).to(data.members[1]).emit("started-typing" , data);
    });

    //online users
    socket.on("came-online" , (userId) => {
        if(!onlineUsers.includes(userId))
            onlineUsers.push(userId);
        io.emit("online-users-updated" , onlineUsers);
    });
    
    socket.on("went-offline", (userId) => {
        onlineUsers = onlineUsers.filter((user) => user !== userId);
        io.emit("online-users-updated", onlineUsers);
    });

    // Listen for 'new-chat' event and broadcast it
    socket.on('new-chat', (data) => {
        socket.broadcast.emit('new-chat', data);
    });

});

//check the connection  of socket from client
// io.on("connection", (socket) => {
//     //socket events will be here
//     // connecting client from server using this socket in server
//     socket.on("send-new-message-to-all" , (data) => {
//         // send to all the clients
//         socket.emit("new-message-from-server" , data);
//     });
// });


app.use(express.json({limit: "50mb"}));
app.use("/api/users", usersRoute);  //Creates an api/users with reference to userRote
app.use("/api/chats", chatsRoute);
app.use("/api/messages", messagesRoute);

import path from "path";
let __dirname = path.resolve();
// render deployment
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/client/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
  });
}

server.listen(port, ()=> console.log(`Server is running on port ${port}`));