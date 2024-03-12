import dotenv from "dotenv";
import connectdb from "./db/index.js";
import { app } from "./app.js";

// const path= import path from ex
// const path = require('path');
// import * as path from 'path';
dotenv.config({
    path:"./.env"
})


connectdb()
.then(()=>{
    app.listen( process.env.PORT || 8000 , ()=>{
        console.log(`server is running on port ${process.env.PORT}`);
    })
})

// __dirname = path.resolve(path.dirname('src'));
app.get('/',(req,res)=>{
    res.send('hello')
    // res.sendFile(path.join(__dirname+'/index.html'))
})
