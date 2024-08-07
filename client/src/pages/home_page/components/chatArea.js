import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SendMessage,GetMessages } from "../../../apicalls/messages";
import { HideLoader, ShowLoader } from "../../../redux/loaderSlice";
import toast from "react-hot-toast";
import moment from "moment";
import { ClearChatMessages } from "../../../apicalls/chats";
import { SetAllChats } from "../../../redux/userSlice";
import store from "../../../redux/store";
import EmojiPicker from "emoji-picker-react";



function ChatArea(props) {
    const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
    const [isReceipentTyping , setIsReceipentTyping] = React.useState(false);
    const dispatch = useDispatch();
    const [newMessage,setNewMessage] = React.useState("");
    const {selectedChat ,user ,allChats} =useSelector(state => state.userReducer);
    const [messages = [], setMessages] = React.useState([]);
    const receipentUser = selectedChat.members.find(
        (mem) => mem._id !== user._id
    );

    const ShowProfilePic = (receipentUser) =>
    {
        if(receipentUser.profilePic)
            {
                return (
                    <img 
                        src = {receipentUser.profilePic}
                        alt = "profile-pic"
                        className="w-10 h-10 rounded-full"
                    />
                );
            }
        else
            {
                return(
                    <div className="bg-gray-500 rounded-full h-10 w-10 flex items-center justify-center">
                        <h1 className="uppercase text-xl font-semibold text-white">{receipentUser.name[0]}</h1>
                    </div>
                );
            }
    }

    async function sendNewMessage()
    {
        try{
            const message = {
                chat: selectedChat._id,
                sender: user._id,
                text: newMessage
            };

            //send message to server using socket
            props.socket.emit("send-message" , {
                ...message,
                members: selectedChat.members.map((mem) => mem._id),
                createdAt: moment().format('YYYY-MM-DD[T]HH:mm:ss'),
                read: false
            });
            //send message to server to save in db

            const result = await SendMessage(message);
            if(result.success)
                {
                    setNewMessage("");
                    setShowEmojiPicker(false);
                }
        }catch(err){
            toast.error(err.message);
        }
    }

    async function getMessages()
    {
        try{
            dispatch(ShowLoader());
            const result = await GetMessages(selectedChat._id);
            dispatch(HideLoader());
            if(result.success)
                {
                    setMessages(result.data);
                }
        }catch(err){
            dispatch(HideLoader());
            toast.error(err.message);
        }
    }

    async function clearUnreadMessages()
    {
        try{
            props.socket.emit("clear-unread-messages" , {
                chat: selectedChat._id,
                members: selectedChat.members.map((mem) => mem._id)
            });

            const result = await ClearChatMessages(selectedChat._id);
            if(result.success)
            {
                const updatedChats = allChats.map((chat) => {
                    if(chat._id === selectedChat._id)
                        return result.data;
                    return chat;
                });
                dispatch(SetAllChats(updatedChats));
            }
        }catch(err){
            toast.error(err.message);
        }
    }

    function getDateInRegularFormat(date)
    {
        let result = '';

        //if date is today , return time in hh:mm format
        if(moment(date).isSame(moment(),"day"))
            result = moment(date).format("hh:mm");
        //if date is yesterday, return yesterday and time in hh:mm format
        else if(moment(date).isSame(moment().subtract(1,"day"), "day"))
            result = `Yesterday ${moment(date).format("hh:mm")}`;
        //if date is this year, return date and time in MMM DD hh:mm format
        else if(moment(date).isSame(moment(), "year"))
            result = moment(date).format("MMM DD hh:mm");

        return result;
    }

    useEffect(() => {

        getMessages();
        if(selectedChat?.lastMessage?.sender !== user._id)
            clearUnreadMessages();

        //receive message from server using socket
        props.socket.off("receive-message").on("receive-message" , (message) => {
            const selectedChatTemp = store.getState().userReducer.selectedChat;//we cannot access the states or redux variables directly in the socket events.
            if(selectedChatTemp._id === message.chat)
            {
                setMessages((messages) => [...messages,message]);
            }

            if(selectedChatTemp._id === message.chat && message.sender !== user._id)
            {
                clearUnreadMessages();
            }
        });

        //clear unread messages from server using socket
        props.socket.on("unread-messages-cleared" , (data) => {
            const tempAllChats = store.getState().userReducer.allChats;
            const tempSelectedChat = store.getState().userReducer.selectedChat;

            if(data.chat === tempSelectedChat._id)
            {
                //update unreadmessages count in selected chat
                const updatedChats = tempAllChats.map((chat) => {
                    if(chat._id === data.chat)
                    {
                        return (
                            {
                                ...chat,
                                unreadMessages: 0
                            }
                        );
                    }
                    return chat;
                });

                dispatch(SetAllChats(updatedChats));

                //set all messages as read
                setMessages((prevMessages) => {
                    return prevMessages.map((message) => {
                        return{
                            ...message,
                            read: true
                        };
                    });
                });
            }
        });

        //receipent typing
        props.socket.on("started-typing" , (data) => {
            const selectedChat = store.getState().userReducer.selectedChat;
            if(data.chat === selectedChat._id && data.sender!==user._id)
            {
                setIsReceipentTyping(true);
            }
            setTimeout(() => {
                setIsReceipentTyping(false);
            },1500);
        });

    },[selectedChat]);

    useEffect(() => {
        //always scroll to bottom for messages id
        const messagesContainer = document.querySelector("#messagesArea");
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, [messages]);

    return(
        <div className="bg-white h-[82vh] border rounded-2xl w-full flex flex-col justify-between p-5">
            {/* part 1 : selected receipent user */}
            <div>
                <div className="flex gap-5 items-center mb-2" >
                    {ShowProfilePic(receipentUser)}
                <h1 className="uppercase">{receipentUser.name}</h1>
                </div>
                <hr />
            </div>
            {/* part 2 : chat messages */}
            <div className="h-[55vh] overflow-y-scroll p-5" id="messagesArea">
                <div className="flex flex-col gap-2 ">
                    {messages.map((message) => {
                        const isCurrentUserIsSender = message.sender === user._id;
                        return (
                                <div className={`flex ${isCurrentUserIsSender && 'justify-end'}`}>
                                    <div className="flex flex-col gap-1">
                                        <h1 className={`${isCurrentUserIsSender ? "bg-primary text-white rounded-tr-none" : "bg-gray-300 text-primary rounded-tl-none"} p-2 rounded-xl`}
                                        >{message.text}</h1>
                                        <h1 className="text-gray-500 text-sm">{getDateInRegularFormat(message.createdAt)}</h1>
                                    </div>
                                    {isCurrentUserIsSender && (
                                        <i className={`ri-check-double-line text-lg p-1 ${message.read ? "text-blue-500" : "text-gray-400"}`}></i>
                                    )}
                                </div>
                        );

                    })}

                    {isReceipentTyping && (
                        <div className="pb-10">
                            <h1 className="bg-blue-100 text-primary rounded-xl p-2 w-max">typing...</h1>
                        </div>
                    )}
                </div>
            </div>
            {/* part 3 : chat input */}
            <div>
                <div className=" h-18 rounded-xl border-gray-300 shadow border flex justify-between p-2 items-center relative">
                    {showEmojiPicker && (
                        <div className="absolute -top-96 left-0">
                            <EmojiPicker 
                                height={350}
                                onEmojiClick={(event) => {
                                    setNewMessage(newMessage + event.emoji);
                                }}
                            />
                        </div>
                    )}

                    <i className="ri-emotion-line cursor-pointer text-2xl pl-2"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    ></i>

                    <input type="text" placeholder="Type a message" className="w-[90%] border-0 h-full rounded-xl focus:border-none" 
                        value={newMessage}
                        onChange={(event) => {
                            setNewMessage(event.target.value);
                            props.socket.emit("typing" , {
                                chat: selectedChat._id,
                                members: selectedChat.members.map((mem) => mem._id),
                                sender: user._id
                            });
                        }}
                    />
                    <button className="bg-primary text-white py-1 px-5 rounded h-max" onClick={sendNewMessage}>
                        <i className="ri-send-plane-2-line text-white"></i>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ChatArea;