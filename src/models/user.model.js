import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";



const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim:true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim:true,
    },
    fullName: {
        type: String,
        required: true,
        trim:true,
        index:true
    },
    password:{
        type:String,
        required:[true, 'Password is required']
    },
    avatar:{
        type:String, //cloudinary url
        required:true
    },
    coverImage:{
        type:String
    },
    watchHistory:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    },
    refreshToken:{
        type:String,
    }
},
{
    timestamps:true
}
)

userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password,10)
    next()
} )

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function(){
    // console.log("Generating Access Token");
    // console.log("Calling generateAccessToken for user: ", this.username);

    const temp = jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )

    // console.log("Generated acecss token: ",temp);
    // console.log("ACCESS_TOKEN_SECRET: ", process.env.ACCESS_TOKEN_SECRET);
    // console.log("ACCESS_TOKEN_EXPIRY: ", process.env.ACCESS_TOKEN_EXPIRY);


    return temp
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}



export const User = mongoose.model("User",userSchema);