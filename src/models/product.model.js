import bcrypt from "bcrypt";
import mongoose, { Schema } from "mongoose";
import  Jwt  from "jsonwebtoken";
import { Int32 } from "mongodb";
// structure of the data to be stored in database
const productschema= new mongoose.Schema({
    product_name:{
        type : String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
        
    },
    brand_name:{
        type: String,
        required: true,
        lowercase:true,
        trim:true
    },
    type:{
        type : String,
        required: true,
        trim: true      
    },
    barcode:{
        type:String,
        lowercase:true,
        trim:true,
        unique:true,
        index: true
    },
    ingredients_value:{
        type:String,
        lowercase:true,
        // index: true

    },
    nutritional_value:{
        type:String,
        lowercase:true,
        // index: true
 },
 ingredients_image:{
    type:String,
    // lowercase:true,
    // index: true

},
nutritional_image:{
    type:String,
    // lowercase:true,
    // index: true
}

},{timestamps:true})

// userschema.pre("save",async function (next){
//     if (!this.isModified("password")) return next() 
//     this.password=await bcrypt.hash(this.password,10)
//     const Bmi=parseInt(this.weight)/((parseInt(this.height)/100)**2)
//     // this.bmi=parseInt(this.weight)/((parseInt(this.height)/100)**2)
//     this.bmi=Bmi.toFixed(2)
//     next()
//     // if (!this.isModified("weight")) return next() 
//     // this.bmi=parseInt(weight)/((parseInt(height)/100)**2)
   
//     // next()
    
// })



export const product = mongoose.model("product", productschema)     