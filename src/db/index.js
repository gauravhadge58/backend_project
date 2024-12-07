import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";




const DB_CONNECT = async () => {
    try {
        const ConnectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`MONGODB Connected !! DBHOST: ${ConnectionInstance}`)
    } catch (error) {
        console.log(`MongoDB Connection error: ${error}`)
        console.log(process.env.PORT)
        console.log(process.env.MONGODB_URI)
        console.log(DB_NAME)
        process.exit(1)
    }
}

export default DB_CONNECT