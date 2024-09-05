import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"


const generateAccessAndGenerateToken = async (userId) => {
    try {
        const user = await User.findById(userId)



        const refreshToken = user.generateRefreshToken();


        const accessToken = user.generateAccessToken();


        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })





        return { refreshToken, accessToken }


    } catch (error) {
        throw new ApiError(500, "Somethong went Wrong While generating Token")
    }
}


const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation
    // check if user already exists
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - creat entry in db
    // remove password and refresh token field from responnse
    // check for user creation
    // return response

    const { fullName, email, username, password } = req.body
    // console.log(fullName, email);
    // console.log(req.body,"body then");
    // console.log(req.files,"body then file");


    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // console.log(avatarLocalPath,"avatarpath");

    // const coverImageLocalPath = req.files?.coverImage[0]?.path; //not working for empty 
    // console.log(coverImageLocalPath,"avatarpath");
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }


    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar Image is Required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar Image is Required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken" //which we have not to select bcz by default all are selected 
    )

    if (!createdUser) {
        throw new ApiError(500, "something went wrong while registering a user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Register Successfully")
    )

})


const loginUser = asyncHandler(async (req, res) => {
    // req.body -> data
    // username or email
    // find user
    // password check
    // access and refresh token
    // send cookie

    const { username, email, password } = req.body

    if (!(username || email)) {
        throw new ApiError(400, "Username or Email is Required")
    }

    const user = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (!user) {
        throw new ApiError(404, "User does not Exists!")
    }

    const isPasswordValid = await user.isPasswordCorrect(password);



    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid Password");
    }

    const { refreshToken, accessToken } = await generateAccessAndGenerateToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
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

const logoutUser = asyncHandler(async (req, res) => {
    console.log("hiiiii");
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "User Logged Out!")
        )


})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incommingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incommingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }
try {
    
       const decodedToken = jwt.verify(
            incommingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
       const user = await User.findById(decodedToken?._id)
    
       if(!user){
        throw new ApiError(401, "Invalid Refresh Token")
       }
    
       if(incommingRefreshToken !== user?.refreshToken){
        throw new ApiError(401, "Refresh token is expired or used")
       }
    
       const options = {
        httpOnly: true,
        secure: true
       }
    
       const {accessToken, newRefreshToken} = await generateAccessAndGenerateToken(user._id)
    
       return res.status(200)
       .cookie("accessToken", accessToken, options)
       .cookie("refreshToken", newRefreshToken, options)
       .json(
        new ApiResponse(
            200, 
            {accessToken, newRefreshToken},
            "User Access Token refreshed Successfully"
        )
       )
    
} catch (error) {
    throw new ApiError(401, error?.message || "Invalid Refresh Token")
}

})

export { registerUser, loginUser, logoutUser, refreshAccessToken } 