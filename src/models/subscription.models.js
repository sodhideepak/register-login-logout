import mongoose , {Schema}  from "mongoose";

const subscriptionschema = new Schema({

    subscriber:{
        type:Schema.Types.ObjectId,//one who is subscribing 
        ref:"user"
    },
    channel:{
        type:Schema.Types.ObjectId,// one who subscriber subscribing the channel
        ref:"user"
    }

},{timestamps:true})



export const subscription = mongoose.model("subscription",subscriptionschema)