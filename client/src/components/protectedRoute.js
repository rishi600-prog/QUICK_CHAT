import React, { useEffect } from "react";
import { GetAllOtherUsers, GetCurrentUser } from "../apicalls/users";
import { useNavigate } from "react-router-dom";
import { HideLoader, ShowLoader } from "../redux/loaderSlice";
import { useDispatch, useSelector } from "react-redux";
import { SetAllUsers, SetUser, SetAllChats } from "../redux/userSlice";
import {GetAllChats} from "../apicalls/chats";
import {io} from "socket.io-client";
const socket = io("https://quick-chat-s88w.onrender.com");

function ProtectedRoute({children}){
    const {user} = useSelector(state => state.userReducer);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    async function getCurrentUser(){
        try{
            dispatch(ShowLoader());
            const result= await GetCurrentUser();
            const allUsersResponse = await GetAllOtherUsers();
            const allChatsResponse = await GetAllChats();
            dispatch(HideLoader());
            if(result.success)
                {
                    dispatch(SetUser(result.data));
                    dispatch(SetAllUsers(allUsersResponse.data));
                    dispatch(SetAllChats(allChatsResponse.data));
                }
            else
                {
                    navigate("/login");
                }
        }catch(err){
            dispatch(HideLoader());
            navigate("/login");
        }
    }
    
    useEffect(() => {
        if(localStorage.getItem("token"))
            {
                getCurrentUser();
            }
        else
            navigate("/login");

    }, []);

    return(
        <div className="h-screen w-screen bg-gray-100 p-2">
            {/* header */}
            <div className="flex justify-between p-5 background-color rounded">
                <div className="flex item-center gap-1">
                    <i className="ri-chat-quote-fill text-2xl text-white"></i>
                    <h1 className="text-white text-2xl uppercase font-bold cursor-pointer"
                        onClick={() => {navigate("/")}}
                    >QUICK CHAT</h1>
                </div>
                <div className="flex gap-2 text-md items-center bg-white p-2 rounded">
                    {user?.profilePic &&
                        <img
                            src = {user?.profilePic}
                            alt="profile"
                            className="h-8 w-8 rounded-full object-cover" 
                        />
                    }
                    {!user?.profilePic && <i className="ri-id-card-fill text-primary"></i>}
                    <h1 className="underline text-primary cursor-pointer" onClick={()=>{navigate("/profile");}}>{user?.name}</h1>

                    <i className="ri-logout-box-r-line ml-5 text-xl cursor-pointer text-primary"
                        onClick={() => {
                            socket.emit("went-offline", user._id);
                            localStorage.removeItem("token");
                            navigate("/login");
                        }}
                    ></i>
                </div>
            </div>

            {/* content */}
            <div className="py-5">{children}</div>
        </div>
    );
}

export default ProtectedRoute;
