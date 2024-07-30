import axiosInstance from ".";

async function SendMessage(message)
{
    try{
        const result = await axiosInstance.post("/api/messages/newmessage" , message);
        return result.data;
    }catch(err){
        throw err;
    }
}

async function GetMessages(chatId)
{
    try{
            const result = await axiosInstance.get(`/api/messages/getallmessages/${chatId}`);
            return result.data;
    }catch(err){
        throw err;
    }
}
export {SendMessage,GetMessages};