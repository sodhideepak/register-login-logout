
import dotenv from "dotenv";
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
dotenv.config({
    path:"./.env"
})

const app = express()
app.use(cors({
    origin: process.env.CORS_ORIGN
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public "))

//routes import
import userrouter from "./routes/user.routes.js";
import productrouter from "./routes/product.routes.js"

// routes declaration

app.use("/api/v1/users",userrouter)
app.use("/api/v1/users",productrouter)

app.get('/',(req,res)=>{
    res.send([
        {
          "_id": "65f4a3c904ca3a108b7d061c",
          "index": 0,
          "isActive": true,
          "balance": "$1,839.95",
          "age": 22,
          "eyeColor": "blue",
          "name": "Park Tucker",
          "gender": "male",
          "company": "PLASMOX",
          "email": "parktucker@plasmox.com",
          "phone": "+1 (897) 551-3453"
        },
        {
          "_id": "65f4a3c92475273176be6dde",
          "index": 1,
          "isActive": true,
          "balance": "$3,110.10",
          "age": 30,
          "eyeColor": "brown",
          "name": "Charity Pena",
          "gender": "female",
          "company": "ZIGGLES",
          "email": "charitypena@ziggles.com",
          "phone": "+1 (848) 509-2580"
        },
        {
          "_id": "65f4a3c9d02acdc1766f87b0",
          "index": 2,
          "isActive": false,
          "balance": "$2,162.48",
          "age": 32,
          "eyeColor": "green",
          "name": "Wheeler Maldonado",
          "gender": "male",
          "company": "TROPOLIS",
          "email": "wheelermaldonado@tropolis.com",
          "phone": "+1 (972) 545-3850"
        },
        {
          "_id": "65f4a3c98f0ea2cf10395273",
          "index": 3,
          "isActive": false,
          "balance": "$2,383.07",
          "age": 35,
          "eyeColor": "green",
          "name": "Lindsey Willis",
          "gender": "male",
          "company": "PERKLE",
          "email": "lindseywillis@perkle.com",
          "phone": "+1 (926) 574-2453"
        },
        {
          "_id": "65f4a3c9d1cf7706c752676f",
          "index": 4,
          "isActive": false,
          "balance": "$3,052.45",
          "age": 21,
          "eyeColor": "green",
          "name": "Fleming Miranda",
          "gender": "male",
          "company": "LIMOZEN",
          "email": "flemingmiranda@limozen.com",
          "phone": "+1 (888) 461-2000"
        },
        {
          "_id": "65f4a3c9b5d4b5473fcf967a",
          "index": 5,
          "isActive": false,
          "balance": "$2,456.80",
          "age": 20,
          "eyeColor": "blue",
          "name": "Faith Mccall",
          "gender": "female",
          "company": "QUANTASIS",
          "email": "faithmccall@quantasis.com",
          "phone": "+1 (915) 527-2827"
        },
        {
          "_id": "65f4a3c9ecd87189e17c4d3b",
          "index": 6,
          "isActive": true,
          "balance": "$3,494.94",
          "age": 34,
          "eyeColor": "brown",
          "name": "Day Soto",
          "gender": "male",
          "company": "MIRACLIS",
          "email": "daysoto@miraclis.com",
          "phone": "+1 (855) 489-3006"
        }
      ])
    // res.sendFile(path.join(__dirname+'/index.html'))
})

export {app}