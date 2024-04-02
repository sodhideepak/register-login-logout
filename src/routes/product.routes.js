import { Router } from "express";
import {
    registerproduct,
    getproduct
     } from "../controllers/product.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router =Router()

router.route("/registerproduct").post(
    upload.fields([
        {
        name:"ingredients_image",
        maxCount:1
        },
        {
        name:"nutritional_image",
        maxCount:1
        
        },
        {
            name:"barcode",
            maxCount:1
            
            }
    ]),
    registerproduct)

router.route("/getproduct").post(getproduct)

// router.route("/logout" ).post(verifyJWT,logout)

// router.route("/refresh-token" ).post(refreshAccessToken)

// router.route("/change-password" ).post(verifyJWT,changeCurrentPassword)

// router.route("/current-user" ).post(verifyJWT,getCurrentuser)

// router.route("/update-account" ).patch(verifyJWT,updateAccountDetails)

// router.route("/avatar" ).patch(verifyJWT,upload.single("avatar"),updateUserAvatar)

// router.route("/coverimage" ).patch(verifyJWT,upload.single("coverimage"),updateUsercoverImage)

// router.route("/channel-profile").get(verifyJWT,getUserChannelProfile)

// router.route("/history").get(verifyJWT,getWatchHistory)

// router.route("/forgotpassword").post(forgotpassword)

// router.route("/resetpassword").post(resetpassword)


export default router 