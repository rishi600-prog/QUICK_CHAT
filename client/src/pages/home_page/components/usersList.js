import React, { useEffect } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { CreateNewChat } from "../../../apicalls/chats";
import { SetAllChats, SetSelectedChat } from "../../../redux/userSlice";
import { HideLoader, ShowLoader } from "../../../redux/loaderSlice";
import moment from "moment";
import store from "../../../redux/store";


function UsersList(props) {

    const {allUsers,allChats,user,selectedChat} = useSelector( state => state.userReducer);
    const dispatch = useDispatch();
    const getData = () => { 
        //if search key is empty, then return all chats else return filtered chats and users
        if(props.searchKey === "")
            {
                return allChats;
            }
        return allUsers.filter((user) => user.name.toLowerCase().includes(props.searchKey.toLowerCase()));
    };


    const ShowProfilePic = (userObject) =>
        {
            if(userObject?.profilePic)
                {
                    return (
                        <img 
                            src = {userObject?.profilePic}
                            alt = "profile-pic"
                            className="w-10 h-10 rounded-full"
                        />
                    );
                }
            else
                {
                    return(
                        <div className="bg-gray-400 rounded-full h-10 w-10 flex items-center justify-center relative">
                            <h1 className="uppercase text-xl font-semibold text-white">{userObject?.name[0]}</h1>
                        </div>
                    );
                }
        }

    async function createNewChat(userObject)
        {
            console.log(userObject);
            try{
                dispatch(ShowLoader());
                const result = await CreateNewChat([user._id, userObject]);
                dispatch(HideLoader());
                if(result.success)
                    {
                        toast.success(result.message);
                        const newChat = result.data;
                        const updatedChats = [...allChats, newChat];
                        dispatch(SetAllChats(updatedChats));
                        SetSelectedChat(newChat);

                        props.socket.emit('new-chat', { chat: newChat });
                        window.location.href = "/";
                    }
                else
                    toast.error(result.message);
            }catch(err){
                dispatch(HideLoader());
                toast.error(err.message);
            }
        }

    function OpenChat(receipentUserId)
        {
            const chat = allChats.find(
                (chat) =>
                    chat.members.map((mem) => mem._id).includes(user._id) && chat.members.map((mem) => mem._id).includes(receipentUserId)
            );
            if(chat) {
                dispatch(SetSelectedChat(chat));
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

    const getLastMsg = (userObj) =>
        {
            const chat = allChats.find( (chat) => chat.members.map((mem) => mem._id).includes(userObj._id) );

            if(!chat || !chat?.lastMessage)
                {
                    return "";
                }
            else
                {
                    const lastMessagePerson = chat?.lastMessage?.sender === user._id ? "You :" : "";
                    return ( 

                        <div className="flex justify-between w-72">
                            <h1 className="text-gray-600 text-sm">
                                {lastMessagePerson} {chat?.lastMessage?.text}
                            </h1>
                            <h1 className="text-gray-500 text-sm">
                                {getDateInRegularFormat(chat?.lastMessage?.createdAt)}
                            </h1>
                        </div>

                     );
                }
        }


    function getUnreadMessages(userObj)
    {
        const chat = allChats.find((chat) => chat.members.map((mem) => mem._id).includes(userObj._id));

        if(chat && chat?.unreadMessages && chat?.lastMessage?.sender !== user._id)
            {
                return (
                    <div className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {chat?.unreadMessages}
                    </div>
                );
            }
    }

    const getIsSelectedChatOrNot = (userObj) => {
            if (selectedChat) {
            return selectedChat.members.map((mem) => mem._id).includes(userObj._id);
            }
            return false;
        };

    
    useEffect(() => {
            props.socket.once("receive-message" , (message) => {

                //if the chat area opened is not equal to chat in message, then increase unread messages by 1 and update last message
                const tempSelectedChat = store.getState().userReducer.selectedChat;
                let tempAllChats = store.getState().userReducer.allChats;
                if(tempSelectedChat?._id !== message?.chat)
                {
                    const updatedAllChats = tempAllChats.map((chat) => {
                        if(chat?._id === message?.chat)
                        {
                            return (
                                {
                                    ...chat,
                                    unreadMessages: (chat?.unreadMessages || 0) + 1,
                                    lastMessage: message
                                }
                            );
                        }
                        return chat;
                    });
                    tempAllChats = updatedAllChats;
                }

                //always latest message chat will be on top
                const latestChat = tempAllChats.find((chat) => chat?._id === message?.chat);
                const otherChats = tempAllChats.filter((chat) => chat?._id !== message?.chat);
                tempAllChats = [latestChat, ...otherChats];

                dispatch(SetAllChats(tempAllChats));
            });

            props.socket.on('new-chat', (data) => {
                window.location.reload();
            });
    } , [allChats]);

    



    return (
        <div className="flex flex-col gap-3 mt-5 lg:w-96 xl:w-96 md:w-60 sm:w-60">
            {getData().map((chatObjectOrUserObject) => {

                let userObject = chatObjectOrUserObject;
                if(chatObjectOrUserObject.members)
                    {
                        userObject = chatObjectOrUserObject.members.find((mem) => mem._id !== user._id);
                    }

                return(
                    <div className={`shadow-sm border p-2 rounded-xl bg-white flex justify-between items-center cursor-pointer w-full
                                        ${getIsSelectedChatOrNot(userObject,selectedChat) && "bg-blue-200 border-gray-400 border-2"}`} key={userObject._id} onClick={()=>OpenChat(userObject._id)}>
                        <div className="flex gap-5 items-center" >
                            {ShowProfilePic(userObject)}
                            <div className="flex flex-col gap-1">
                                <div className="flex gap-1">
                                    <div className="flex gap-1 items-center">
                                        <h1>{userObject.name}</h1>
                                        {props.onlineUsers.includes(userObject._id) && (
                                            <div>
                                                <div className="bg-green-600 h-3 w-3 rounded-full"></div>
                                            </div>
                                        )}
                                    </div>
                                    {getUnreadMessages(userObject)}
                                </div>
                                {getLastMsg(userObject)}
                            </div>
                        </div>
                        <div onClick={()=> createNewChat(userObject._id)}>
                            { !allChats.find((chat) => chat.members.map((mem)=> {return mem._id}).includes(userObject._id)) && (
                                <button className="border-primary border text-primary bg-white p-1 rounded">
                                    Create Chat
                                </button>
                            )}
                        </div>
                    </div>
                );


            })}
        </div>
    );
}


export default UsersList;
