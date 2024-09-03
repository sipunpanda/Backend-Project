import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

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
    console.log(fullName, email);

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

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
        coverImage: avatar?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

const createdUser = await User.findById(user._id).select(
    "-password -refreshToken" //which we have not to select bcz by default all are selected 
)

if(!createdUser){
    throw new ApiError (500, "something went wrong while registering a user")
}

return res.status(201).json(
    new ApiResponse(200, createdUser, "User Register Successfully")
)


})

export { registerUser } 