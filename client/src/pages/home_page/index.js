import React, { useEffect } from 'react'
import UserSearch from './components/userSearch'
import ChatArea from './components/chatArea'
import UsersList from './components/usersList';
import { useSelector } from 'react-redux';
import {io} from "socket.io-client";
import chatpng from "../../images/pngwing.png"
// connecting server from client using this socket in client
const socket = io("https://quick-chat.onrender.com"); //establish connection to localhost 5000 : afterwards emit and listen the events 
localStorage.setItem('socket', socket);

function Home() {
    
    const[searchKey , setSearchKey] = React.useState("");
    const {selectedChat , user} = useSelector((state) => state.userReducer);
    const[onlineUsers , setOnlineUsers] = React.useState([]);

    useEffect(() => {

        //join the Room
        if(user)
        {
            socket.emit("join-room" , user._id);
            socket.emit("came-online" , user._id);

            socket.on("online-users-updated" , (users) => {
                setOnlineUsers(users);
            });
        }
    }, [user]);



    return (
        <div className="flex gap-5">

            {/* user search userlist */}
            <div className="w-96">
                <UserSearch 
                    searchKey={searchKey}
                    setSearchKey={setSearchKey}
                />
                <UsersList 
                    searchKey = {searchKey}
                    socket = {socket}
                    onlineUsers = {onlineUsers}
                    setSearchKey = {setSearchKey}
                />
            </div>

            {/* Chat box part */}
            {selectedChat && (
                <div className="w-full">    
                    <ChatArea 
                        socket={socket}
                    />
                </div>
            )}
            {!selectedChat && (
                <div className='w-full h-[80vh] items-center justify-center flex bg-white flex-col'>    
                    <img
                        src={chatpng}
                        alt=''
                        className='w-96 h-96'
                    />
                    <h1 className='text-2xl font-semibold text-gray-500'>
                        Select a user to chat
                    </h1>
                </div>
            )}
        </div>
    );
}

export default Home