import axiosInstance from ".";

async function LoginUser(user) {
    try{
        const result = await axiosInstance.post("/api/users/login", user);
        return result.data;
    }catch(err){
        return err.result.data;
    }
};

async function RegisterUser(user) {
    try{
        const result = await axiosInstance.post("/api/users/register", user);
        return result.data;
    }catch(err){
        return err.result.data;
    }
};

async function GetCurrentUser() {
    try{
        const result= await axiosInstance.get("/api/users/getcurrentuser");
        return result.data;
    }catch(err){
        return err.result.data;
    }
}

async function GetAllOtherUsers() {
    try{
        const result = await axiosInstance.get("/api/users/getallusers");
        return result.data;
    }catch(err){
        return err.result.data;
    }
}

async function UpdateProfilePicture(image)
{
    try{
        const  result = await axiosInstance.post("/api/users/update-profile-picture", {image});
        return result.data;
    }catch(err){
        return err.response.data;
    }
}

export {LoginUser,RegisterUser,GetCurrentUser,GetAllOtherUsers,UpdateProfilePicture};
