import axiosInstance from ".";

async function GetAllChats() {
    try{
        const result = await axiosInstance.get("/api/chats/getallchats");
        return result.data;
    }catch(err){
        throw err;
    }
}

async function CreateNewChat(members){
    try{
        const result = await axiosInstance.post("/api/chats/createnewchat", {members});
        return result.data;
    }catch(err){
        throw err;
    }
}

async function ClearChatMessages(chatId){
    try{
        const result = await axiosInstance.post("/api/chats/clearunreadmessages",{chat: chatId});
        return result.data;
    }catch(err){
        throw err;
    }
}

export {GetAllChats,CreateNewChat,ClearChatMessages};