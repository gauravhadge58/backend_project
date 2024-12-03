// require('dotenv').config({ path: "./env" })

import dotenv from "dotenv"

// import express from "express";
// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
import ConnectionInstance from "./db/index.js";
dotenv.config({path:'./env'})


ConnectionInstance()




// const app = express()

// ;(async ()=>{
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on("error",(error)=>{
//             console.log("ERR:",error)
//             throw error
//         })

//         app.listen(`${process.env.PORT}`,()=>{
//         console.log(`Server listening at Port: ${process.env.PORT}`)
//         })
//     } catch (error) {
//         console.log(error)
//         throw err
//     }
// })()