import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js"
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

        if (!user) {
            throw new ApiError(401, "Invalid Refresh Token")
        }

        if (incommingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newRefreshToken } = await generateAccessAndGenerateToken(user._id)

        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, newRefreshToken },
                    "User Access Token refreshed Successfully"
                )
            )

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token")
    }

})


const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    const user = await User.findById(user?._Id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Incorrect Old Password")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Password Changed Successfully"
            )
        )
})


const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200)
        .json(new ApiResponse(200, req.user, "current user fetched successfully")
        )
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body

    if (!(fullName || !email)) {
        throw new ApiError(400, "Full Name and Email are Required");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: email,
            fullName
        },
        {
            new: true
        }
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User Account Details Updated Successfully"))
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw ApiError(400, "Avatar file is missing")
    }


    // delete old image

    const oldImage = await User.findById(user._id)
    if (!oldImage?.avatar) {
        throw ApiError(400, "Old Avatar file is missing")
    }

    await deleteFromCloudinary(oldImage.avatar);

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar.url) {
        throw ApiError(400, "Error uploading avatar")

    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:
                { avatar: avatar.url }
        },
        { new: true }
    ).select("-password")

    return res.status(200)
        .json(new ApiResponse(200, user, "avatr updated successfully")
        )



})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw ApiError(400, "Cover Image file is missing")
    }

    // delete old image

    const oldImage = await User.findById(user._id)
    if (!oldImage?.coverImage) {
        throw ApiError(400, "Old Cover image file is missing")
    }

    await deleteFromCloudinary(oldImage.coverImage);

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!coverImage.url) {
        throw ApiError(400, "Error uploading coverImage")

    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:
                { avatar: coverImage.url }
        },
        { new: true }
    ).select("-password")

    return res.status(200)
        .json(new ApiResponse(200, user, "coverImage updated successfully")
        )



})

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const username = req.params

    if (!username?.trim()) {
        throw new ApiError(400, "Username is required")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelSubscribedToCount: {
                    $size: "$subscribedTo"
                },

                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },//subscriber is from subscription model
                        then: true,
                        else: false
                    }
                }

            }

        },
        {
            $project: {   // project, projection deta hai ki sare values na projection kar ke kuch selected values dunga
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }

    ])

    console.log("this is what channel returns", channel);

    if(!channel?.length){
        throw new ApiError(404, "Channel not found")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            channel[0],
            "User Channel Profile fetched successfully"
        )
    )
    

})



export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,

} 