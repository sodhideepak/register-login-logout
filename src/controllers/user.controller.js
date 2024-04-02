import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { user } from "../models/user.models.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { uploadoncloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import * as nodemailer from "nodemailer"
import Randomstring from "randomstring";


const sendresetpasswordmail=asynchandler(async(fullname,email,token)=>{

    try {
        const transporter =nodemailer.createTransport({
            host:"smtp.gmail.com",
            port:587,
            secure:false,
            tls:{
                rejectUnauthorized:false
            },
            // service:"gmail",
            auth:{
                user:process.env.emailusername,
                pass:process.env.emailpassword
            }
        })

        const mailoptions={
            from:process.env.emailusername,
            to:email,
            subject:"for reset passowrd",
            html:'<p> hii '+fullname+', please copy the link and <a href="https://register-login-logout.onrender.com/api/v1/users/resetpassword?token='+token+'" > reset your password </a></p>'
        }

        transporter.sendMail(mailoptions,function(error,info){
            if (error) {
                console.log(error)
            } else {
                console.log("mail has been sent :=",info.response);                
            }
        })

        
    } catch (error) {
        throw new ApiError(400,error.message)
    }
})

const generateAccessAndRefreshTokens=async(userid)=>{
    try {
        const User = await user.findById(userid)
        console.log(User);
        const accesstoken = User.generateAccessToken()
        const refreshtoken = User.generateRefreshToken()
        // console.log(refreshtoken);
        User.refreshToken=refreshtoken
        // console.log("1 :",User.refreshtoken);
        // console.log("2 :",refreshtoken);
        await User.save({ validateBeforeSave: false })


        return{accesstoken,refreshtoken}
    
    } catch (error) {
        throw new ApiError(500,"something went wrong while generating access and refresh token")
    }
}

const registeruser = asynchandler(async (req,res)=>{
    // get user details
    // validate the data
    // check if user already exist
    // check for images/avatar
    // upload to cloudinary
    // create user object in db
    // remove refresh token field for input
    // check for user creation
    // return res
    const {fullname,email,username,age,height,weight,password}= req.body
    console.log("email =",email);
    console.log("fullname =",fullname);
    console.log("username=",username);
    console.log("password=",password);
    console.log("height=",height);
    console.log("weight=",weight);
    console.log("age=",age);
    // console.log("files=",req.files);
    // console.log("email =",email);
    

    if([fullname,email,username,password,age].some((field)=> field?.trim()==="")) {
        throw new ApiError(400,"all fields are required")
    }
    const existeduser = await user.findOne(
        {
            $or:[{username},{email}]
        }
    )

    if (existeduser) {
        throw new ApiError(409,"user already registered")
    }

    // const avatarlocalpath =req.files?.avatar[0]?.path;
    // const coverimagelocalpath =req.files?.coverimage[0]?.path;


    // let coverimageLocalPath; 
    // if (req.files && Array.isArray(req.files.coverimage) || req.files.coverimage.Length > 0) {
    //     coverimageLocalPath = req.files.coverimage[0].path
    // }
    //  console.log("1",Array.isArray(req.files.coverimage));
    //  console.log("2",req.files);
    //  console.log("3",req.files.coverimage.Lenght > 0);
    // console.log("coverimage :",coverimageLocalPath);
    // console.log(avatarlocalpath);
    // if (!avatarlocalpath) {
    //     throw new ApiError(400,"avatar is required")
    // }
    
    // const avatar =await uploadoncloudinary(avatarlocalpath);
    // const coverimage =await uploadoncloudinary(coverimageLocalPath);

    // if (!avatar) {
    //     throw new ApiError(400,"avatar file is required")
    // }

    const User=await user.create({
        fullname,
        // avatar:avatar.url,
        // coverimage:coverimage?.url || "",
        email,
        age,
        height,
        weight,
        // healthcheck,
        password,
        // bmi, 
        username: username.toLowerCase(),

    })

    const createduser =await user.findById( User._id).select("-password -refreshToken");    

    if (!createduser) {
        throw new ApiError(500,"something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200,createduser,"user registered sucessfully")
    )

})

const loginuser = asynchandler(async (req,res)=>{

    // req body get data
    // check username / email
    // find the user 
    // check password
    // generate refresh and acess tokens
    // send cookie

    const {email,username,password}= req.body
    console.log("email =",email);
    
    console.log(email,username,password);
    if (!email && !username) {
        throw new ApiError(400,"username or email is required")     
    }

    const User = await user.findOne({
        $or:[ {username},{email}]
    })

    if (!User) {
        throw new ApiError(400, "user does not exist")
        
    }
    // console.log(User._id);
    

    
    const ispasswordvalid= await User.isPasswordcorrect(password)
    // console.log(ispasswordvalid);
    if (!ispasswordvalid) {

        throw new ApiError(400,"invlid user credientials")
        
    } 

    const {accesstoken,refreshtoken} = await generateAccessAndRefreshTokens(User._id)

    const loggedinuser =await user.findById( User._id).select("-password -refreshToken");
    // console.log(loggedinuser);    

    const options={
        httpOnly:true,
        secure:true,
    }

    return res
    .status(200)
    .cookie("accesstoken",accesstoken,options)
    .cookie("refreshtoken",refreshtoken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedinuser,accesstoken,refreshtoken
            },
            "user logged in sucessfully")
    )

})

const logout =asynchandler(async(req,res)=>{
    await user.findByIdAndUpdate(
        req.user._id,{
            $unset: {
                refreshToken: 1 // this removes the field from document
            },
           
        },
        {
            new:true
        }
    )
    
    console.log(req.user._id?.refreshToken);
    

    const options={
        httpOnly:true,
        secure:true,
    }

    return res
    .status(200)
    .clearCookie("accesstoken",options)
    .clearCookie("refreshtoken",options)
    .json(
        new ApiResponse(
            200,
            {},
            "user logged out sucessfully")
    )


})

const refreshAccessToken = asynchandler(async(req,res)=>{
    // console.log("req.body : ",req.body);

    // const incomingrefreshtoken = req.cookies.refreshToken || req.body.refreshToken
    const incomingrefreshtoken = req.body.refreshToken || req.cookies.refreshToken
    
    if(!incomingrefreshtoken){
        throw new ApiError(401,"unauthorized request")
    }
    
    try {
        const decodedtoken = jwt.verify(
            incomingrefreshtoken,
            process.env.Refresh_Token_Secret
        )
    
        // console.log("decodedtoken : ",decodedtoken);
        // console.log("decodedtoken id : ",decodedtoken?._id);
        const User = await user.findById(decodedtoken?._id)
        
        // console.log(User);
        if(!user){
            throw new ApiError(401,"invalid refresh token")
        }
        
        // console.log("incomminrefreshtoken : ",incomingrefreshtoken);
        console.log("User?.refreshToken : ",User?.refreshToken);

        if(incomingrefreshtoken !== User?.refreshToken){
            throw new ApiError(401,"refresh token is expired or used")
        }
    
        const options ={
            httpOnly:true,
            secure:true
        }
    
        const {accesstoken,refreshtoken}=await generateAccessAndRefreshTokens(decodedtoken?._id)

        // console.log("newrefreshtoken : ",refreshtoken);
        // console.log("accesstoken : ",accesstoken);
    
        return res.status(200)
        .cookie("accesstoken",accesstoken,options)
        .cookie("refreshtoken",refreshtoken,options)
        .json(
            new ApiResponse(
                200,
                {
                    accesstoken, refreshtoken:refreshtoken
                },
                "access token refreshed sucessfully"
            )
        )
    
    } catch (error) {
        throw new ApiError(401,error?.message || "invalid refresh token")
    }
})

const changeCurrentPassword = asynchandler(async(req,res)=>{
    const {oldpassword,newpassword}=req.body

    const User = await user.findById(req.user?._id)
    const isPasswordcorrect = await User.isPasswordcorrect(oldpassword)

    if (!isPasswordcorrect) {
        throw new ApiError(400,"invalid password")
        
    }

    User.password=newpassword
    await User.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(new ApiResponse(200,{},"password changed sucessfully"))
})

const getCurrentuser =asynchandler(async(req,res)=>{
    return res
    .status(200)
    .json(new ApiResponse(200,req.user,"user fetched sucessfully"))

})

const updateAccountDetails =asynchandler(async(req,res)=>{

    const {fullname,email}=req.body

    if(!fullname || !email){
        throw new ApiError(400,"all fields are required")
    }

    await user.findByIdAndUpdate(
        req.user._id,{
            $set: {
                fullname,
                email:email
             
            },
           
        },
        {
            new:true
        }
    ).select("-password")
  
    return res
    .status(200)
    .json(new ApiResponse(200,req.user,"user account details updated sucessfully"))

})

const updateUserAvatar =asynchandler(async(req,res)=>{
    
    const avatarlocalpath=req.file?.path

    if (!avatarlocalpath) {
        throw new ApiError(400,"avatar file is mssing")
    }

    const avatar=await uploadoncloudinary(avatarlocalpath)

    if (!avatar.url) {
        throw new ApiError(400,"error while uploading an avatar")
    }

    await user.findByIdAndUpdate(
        req.user._id,{
            $set: {
                avatar:avatar.url
            },
           
        },
        {
            new:true
        }
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"coverimage updated sucessfully"))

})

const updateUsercoverImage =asynchandler(async(req,res)=>{
    
    const coverimagelocalpath=req.file?.path

    if (!coverimagelocalpath) {
        throw new ApiError(400,"avatar file is mssing")
    }

    const coverimage=await uploadoncloudinary(coverimagelocalpath)

    if (!coverimage.url) {
        throw new ApiError(400,"error while uploading an avatar")
    }

    await user.findByIdAndUpdate(
        req.user._id,{
            $set: {
                coverimage:coverimage.url
            },
           
        },
        {
            new:true
        }
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"coverimage updated sucessfully"))
})

const getUserChannelProfile = asynchandler(async(req,res)=>{
    const {username}=req.prams

    if (!username?.trim) {
        throw new ApiError(400,"username is missing")
    }
    
    const channel =await user.aggregate([
        {
            $match: {
                username :username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from:"subscription",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup: {
                from:"subscription",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
        },
        {
            $addFields:{
                subscriberscount:{
                    $size:"$subscribers"
                },
                channelssubscribedtocount:{
                    $size:"$subscribedTo"
                },
                isSubscribed:{
                    if: {$in:[req.user?._id,"$subscribers.subscriber"]},
                    then:true,
                    else:false
                }

            }
        },
        { 
            $project:{
                fullname:1,
                username:1,
                subscriberscount:1,
                channelssubscribedtocount:1,
                isSubscribed:1,
                email:1,
                avatar:1,
                coverimage:1          
            }
        }
    ])

    if (!channel?.length) {
        throw new ApiError(400,"channel does not exists")
        
    }

    return res
    .status(200)
    .json(new ApiResponse(200,channel[0],"user cahnnel fetched sucessfully"))
})

const getWatchHistory = asynchandler(async(req,res)=>{

    const user = await user.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"video",
                localField:"watchhistory",
                foreignField:"_id",
                as:"watchhistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullname:1,
                                        username:1,
                                        avatar:1
                                    }
                                },{
                                    $addFields:{
                                        owner:{
                                            $first:$owner
                                        }
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(ApiResponse(
        200,
        user[0].WatchHistory,
        "watch history fetched sucessfully"))
})

const forgotpassword = asynchandler(async(req,res)=>{



        const email = req.body.email
        const userdata =await user.findOne({email:email})

        if (userdata) {
            const ramdomotp=Randomstring.generate()
            await user.updateOne({email:email},{$set:{token:ramdomotp}})

           sendresetpasswordmail(userdata.fullname,userdata.email,ramdomotp)

           return res
           .status(200)
           .json(new ApiResponse(200,"mail has been sent sucessfully"))
        } else {
            throw new ApiError(200,"user email does not exist")
        }
    

})

const resetpassword = asynchandler(async(req,res)=>{
    const token =req.query.token

    const User = await user.findOne({token:token})

    if (User) {
        const newpassword =req.body.password
        User.password=newpassword
        await User.save({validateBeforeSave:false})
        await user.findByIdAndUpdate({_id:User._id},{$set:{token:''}},{new:true})
    
    } else {
        throw new ApiError(400,"link has been expired")
    }
    
   
    return res
    .status(200)
    .json(new ApiResponse(200,{},"password changed sucessfully"))
})



export {
        registeruser,
        loginuser,
        logout,
        refreshAccessToken,
        changeCurrentPassword,
        getCurrentuser,
        updateAccountDetails,
        updateUserAvatar,
        updateUsercoverImage,
        getUserChannelProfile,
        getWatchHistory,
        forgotpassword,
        resetpassword
    }
