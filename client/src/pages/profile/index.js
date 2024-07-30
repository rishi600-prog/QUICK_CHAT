import moment from "moment";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { HideLoader, ShowLoader } from "../../redux/loaderSlice";
import toast from "react-hot-toast";
import { SetUser } from "../../redux/userSlice";
// import { response } from "express";
import { UpdateProfilePicture } from "../../apicalls/users";

function Profile()
{
    const {user} = useSelector(state => state.userReducer);
    const [image ='',setImage] = React.useState("");
    const dispatch = useDispatch();

    async function onFileSelect(event)
    {
        const file = event.target.files[0];
        const reader = new FileReader(file);
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
            setImage(reader.result);
        };
    }

    async function updateProfilePic()
    {
        try{
            dispatch(ShowLoader());
            const result = await UpdateProfilePicture(image);
            dispatch(HideLoader());
            if(result.success)
            {
                toast.success("Profile Pic Updated");
                dispatch(SetUser(result.data));
            }
            else
            {
                toast.error(result.err);
            }
        }catch(err){
            dispatch(HideLoader());
            toast.error(err.message);
        }
    }

    useEffect(() => {
        if(user?.profilePic)
        {
            setImage(user?.profilePic);
        }
    },[user]);

    return (
        <div className="flex items-center justify-center align-middle h-[80vh]">
        <div  className="text-xl font-semibold uppercase text-gray-500 flex gap-2 flex-col p-2 shadow-md border w-max border-gray-300 rounded">
            <h1>
                {user?.name}
            </h1>
            <h1>
                {user?.email}
            </h1>
            <h1>
                Created At: {moment(user?.createdAt).format("MMMM Do YYYY, h:mm:ss a")}
            </h1>
            {image &&
                <img src={image} alt="profile pic" className="w-32 h-32 rounded-full" />
            }

            <div className="flex gap-2">
                <label htmlFor="file-input" className="cursor-pointer">
                    Update Profile Pic
                </label>
                <input type="file" onChange = {onFileSelect} 
                    className="file-input border-0 cursor-pointer"
                    id = "file-input"
                />
                <button className="contained-button" onClick={updateProfilePic}>
                    Update
                </button>
            </div>
        </div>
        </div>
    );
}

export default Profile;