import userData from "../models/userModel.js";
import express from "express";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import auth from "../middlewares/authMiddleware.js";
import cloudinary from "../cloudinary.js";
const router= express.Router();
const saltRounds=10;

//New Registration of User

router.post("/register" , async (req,res) => {
    try{
        //Check if email already exists in the database
        
        if(!req.body.name || !req.body.email || !req.body.password )
            {
                return res.send({
                    success: false,
                    message: "Enter the required fields"
                })
            }

        var passw=  /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{10,20}$/;
        if(!req.body.password.match(passw)) 
            { 
                return res.send({
                    success: false,
                    message: "password should be between 10 to 20 characters which contain at least one numeric digit and a special character"
                })
            }

        const currentUser = await userData.findOne({ email: req.body["email"]});
        if(currentUser)
            {
                return res.send({
                    success: false,
                    message: "User already exists"
                })
            }
        if(req.body.name && req.body.email && req.body.password )
            {
                await bcrypt.hash(req.body["password"],saltRounds, async(err,hash) => {
                    if(err)
                        {
                            console.log(err.stack);
                        }
                    else
                        {
                            if(hash)
                                {
                                    console.log("Hashed successfully");
                                    req.body["password"]=hash;
                                    const newUser = new userData(req.body);
                                    await newUser.save();
                                }
                            else
                                console.log("Hashing unsuccessful");
                        }
                });
                    
                        
                res.send({
                    success: true,
                    message: "User profile created succesfully, Please Login using the credentials"
                })
            }
        

    }catch(err){
        res.send({
            message: err.message,
            success: false
        })
    }
})


// Login User

router.post("/login" , async (req,res) => {
    try{
        //Check if user exists in the database

        const checkUserExist = await userData.findOne({ email: req.body["email"]});
        if(!checkUserExist)
            {
                return res.send({
                    success: false,
                    message: "User does not exist"
                })
            }

        //Check if password is matching

        const checkValid = await bcrypt.compare(req.body["password"], checkUserExist.password);

        if(!checkValid)
            {
                return res.send({
                    success: false,
                    message: "Incorrect password"
                })
            }
        
        //create and assign token
        const token = jwt.sign({ userId : checkUserExist._id}, process.env.JWT_SECRET, {expiresIn: "20d"});
        res.send({
            success: true,
            message: "User logged in successfully",
            data : token
        })
    }catch(err){
        res.send({
            message: err.message,
            success: false
        })
    }
})

//Get the current user

router.get("/getcurrentuser", auth, async (req,res) => {
    try{
        const currentUser = await userData.findOne({ _id: req.body.userId});
        res.send({
            success: true,
            message: "User fetched successfully",
            data: currentUser
        });
    }catch(err){
        res.send({
            message: err.message,
            success: false
        });
    }
});

//get all users excluding the current user (for seaching)

router.get("/getallusers", auth , async(req,res) => {
    try{
        const allOtherUsers = await userData.find({ _id: { $ne: req.body.userId } });
        res.send({
            success: true,
            message: "Users fetched successfully",
            data: allOtherUsers
        });
    }catch(err){
        res.send({
            message: err.message,
            success: false
        });
    }
});

//update user profile picture

router.post("/update-profile-picture", auth, async (req,res) => {

    try{
        const image = req.body.image;

        //upload image to cloudinary and get URL
        const uploadedImage = await cloudinary.uploader.upload(image,{
            folder: "chat-app",
        });

        //update user profile picture
        const user = await userData.findOneAndUpdate(
            {_id: req.body.userId},
            {profilePic: uploadedImage.secure_url},
            {new: true}
        );

        res.send({
            success: true,
            message: "Profile picture updated successfully",
            data: user
        });
    }catch(err){
        res.send({
            message: err.message,
            success: false
        });
    }
});

export default router;