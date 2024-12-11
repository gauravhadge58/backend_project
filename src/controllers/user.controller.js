import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { jwt } from "jsonwebtoken";

const generateAccessAndRefreshTokens = async(userId)=>{
    try {
        const user = await User.findById(userId)
        // console.log(user)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        
        // console.log("Generated access Token: ",accessToken)
        // console.log("Generated refresh Token: ",refreshToken)

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false}) 

        
        return {accessToken,refreshToken}


    } catch (error) {
        throw new ApiError(500, "Sometthing Went wrong while generating access Token")
    }
}

const registerUser = asyncHandler( async (req,res)=>{
 //steps
//get user details from front end
//validation
//check if user already exist
//checl for images, avatar
//upload them to cloudinary , avatar
//create user object -create entry in ddb
//remove password and refresh token from response
//check for user creation
//return res 




const {fullName,email,username,password} = req.body
//console.log("Email : ", email);

//validation
// if(fullName===""){
//     throw new ApiError(400, "Full name is required")
// }

if (
    [fullName,email,username,password].some((field)=>
        (field?.trim()===""))
) {
    throw new ApiError(400,"All fields are required..")
}

const existedUser = await User.findOne({
    $or: [{ username }, { email }]
})

if (existedUser) {
    throw new ApiError(409,"username or email already exists")
}

const avatarLocalPath = req.files?.avatar[0]?.path;
let coverImageLocalPath ;

if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    coverImageLocalPath = req.files.coverImage[0].path
}

if(!avatarLocalPath){
    throw new ApiError(400,"Avatar File is required");
}



const avatar = await uploadOnCloudinary(avatarLocalPath)
const coverImage  = await uploadOnCloudinary(coverImageLocalPath)

if(!avatar){
    throw new ApiError(400,"Avatar file is required");
}

const user = await  User.create({
    fullName,
    avatar: avatar.url,
    coverImage:  coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
})

const createdUser  = await User.findById(user._id).select(
    "-password -refreshToken"
)

if (!createdUser) {
    throw new ApiError(500,"Something went wrong while registering user")
}

return res.status(201).json(
    new ApiResponse(200, createdUser , "User registered Successfully")
)


})

const loginUser = asyncHandler(async (req,res) => {
    //take data from req.body
    //username or email
    //find the user
    //password check
    //access and refresh token generate
    //send cookies
    //return response


    const {email, username, password} = req.body
    
    if(!username || !email){
    if(!username && !email){
        throw new ApiError(400, "username or email is required")
    }
    }


    const user= await User.findOne({
        $or: [{username},{email}]
    })

    if(!user){
        throw new ApiError(404, "User not found")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid User Creditianls")
    }

    console.log("Password Verified")

    const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)
    // console.log("Access and refresh tokens: ",accessToken,refreshToken)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )

})

const logoutUser = asyncHandler(async (req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: undefined
            }
        },{
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json( new ApiResponse (200,{}, "User Logged out successfully"))

})

const refreshAccessToken = asyncHandler(async (req,res)=>{
    const incomingRefreshToken = req.cookies.accessToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized Access")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken, 
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user  = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401,"Invalid Refresh Token")
        }
        
        if(incomingRefreshToken!==user?.refreshToken){
            throw new ApiError(401, "Refresh Token Expired")
        }
    
        const options = {
            httpOnly:true,
            secure:true
        }
    
        const {accessToken, newrefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken",accessToken, options)
        .cookie("refreshToken",newrefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken: newrefreshToken},
                "Access Token Refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || " Invalid Refresh Token")
    }

})

export {registerUser, loginUser, logoutUser,refreshAccessToken}




