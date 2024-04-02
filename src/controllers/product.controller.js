import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { product } from "../models/product.model.js";
import bcrypt from "bcrypt";
import { uploadoncloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import * as nodemailer from "nodemailer"
import Randomstring from "randomstring";
import { createWorker } from 'tesseract.js';




// const createWorker = Tesseract
async function recognizeText(imagePath) {
    const worker = await createWorker("eng")
    const { data: { text } } = await worker.recognize(imagePath);
    await worker.terminate();
    return text;
}


function paragraphToJson(paragraph) {
    // Split the paragraph into lines
    const lines = paragraph.trim().split(',');
    
    // Initialize an empty object to store the JSON data
    const jsonData = {};
    
    // Process each line
    lines.forEach(line => {
        // Split the line into key and value using '-'
        const [key, value] = line.split('-').map(item => item.trim());
        
        // Handle cases where the line doesn't contain a key-value pair
        if (key && value) {
            // Add the key-value pair to the JSON data object
            jsonData[key] = value;
        } else {
            // Handle additional information (e.g., "suitable for vegetarians")
            // You can customize this part based on your specific requirements
            if (!jsonData.additionalInfo) {
                jsonData.additionalInfo = [];
            }
            jsonData.additionalInfo.push(line);
        }
    });
    
    return jsonData;
}




const registerproduct = asynchandler(async (req,res)=>{


    // get user details
    // validate the data
    // check if user already exist
    // check for images/avatar
    // upload to cloudinary
    // create user object in db
    // remove refresh token field for input
    // check for user creation
    // return res
    const {product_name,brand_name,type,barcode}= req.body
    // console.log("email =",email);
    // console.log("fullname =",fullname);
    // console.log("username=",username);
    // console.log("password=",password);
    // console.log("height=",height);
    // console.log("weight=",weight);
    // console.log("age=",age);
    // console.log("files=",req.files);
    // console.log("email =",email);
    

    if([product_name,brand_name,type,barcode].some((field)=> field?.trim()==="")) {
        throw new ApiError(400,"all fields are required")
    }
    




    const ingredientsimagelocalpath =req.files?.ingredients_image[0]?.path;
    const nutritionimagelocalpath =req.files?.nutritional_image[0]?.path;
    // const barcodeimagelocalpath =req.files?.barcode[0]?.path;
    

    //  console.log("1",(req.files.barcode));
    //  console.log("barcodeimagelocalpath :",barcodeimagelocalpath);
    //  console.log("3",req.files.nutritional_image);
    // console.log("nutritionimagelocalpath :",nutritionimagelocalpath);
  


    
    // const barcodetext=await recognizeText(barcodeimagelocalpath)
    const ingredientstext=await recognizeText(ingredientsimagelocalpath)
    const nutritiontext=await recognizeText(nutritionimagelocalpath)

    // console.log(barcodetext);

    const replacedParagraph = ingredientstext.replace(/\n/g, " ");
    // // Convert paragraph text to JSON data
    const jsonData = paragraphToJson(replacedParagraph);
    const jsonDatan = paragraphToJson(nutritiontext);

    // // Display the JSON data
    // console.log("1 :",JSON.stringify(jsonData, null, 2));
    console.log("2 :",jsonData);
    console.log("3 :",nutritiontext);



 
    if (!ingredientsimagelocalpath) {
        throw new ApiError(400,"ingredientsimage is required")
    }
    if (!nutritionimagelocalpath) {
        throw new ApiError(400,"nutritionimage is required")
    }
    
    const ingredients =await uploadoncloudinary(ingredientsimagelocalpath);
    const nutrition =await uploadoncloudinary(nutritionimagelocalpath);

    // console.log("ingredients :",ingredients);
    // console.log("nutrition :",nutrition);
    // console.log("ingredients.url",ingredients.url);

    if (!ingredients || !nutrition) {
        throw new ApiError(400,"file is required")
    }


    const productdetail=await product.create({

        ingredients_image:ingredients.url,

        nutritional_image:nutrition.url,       
        product_name,
        brand_name,
        type,
        // barcode:barcodetext,
        barcode,
        nutritional_value:nutritiontext,
        ingredients_value:ingredientstext

    })

    const createdproduct =await product.findById( productdetail._id);    

    if (!createdproduct) {
        throw new ApiError(500,"something went wrong while registering the product")
    }

    return res.status(201).json(
        new ApiResponse(200,createdproduct,"product registered sucessfully")
    )

})

const getproduct = asynchandler(async (req,res)=>{

    const {barcode}= req.body
    console.log(barcode);
    

    const productdetail = await product.findOne({barcode})

    console.log(productdetail);
    if (!productdetail) {
        throw new ApiError(400, "product does not exist")
        
    }


    const productapi =await product.findById( productdetail._id); 


    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                productapi
            },
            "user logged in sucessfully")
    )

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



export {
        // registeruser,
        // loginuser,
        // logout,
        // refreshAccessToken,
        // changeCurrentPassword,
        // getCurrentuser,
        // updateAccountDetails,
        // updateUserAvatar,
        // updateUsercoverImage,
        // getUserChannelProfile,
        // getWatchHistory,
        // forgotpassword,
        // resetpassword,
        registerproduct,
        getproduct
    }
