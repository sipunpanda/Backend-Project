import Router from "express";
import {
    changeCurrentPassword,
    getCurrentUser,
    getUserChannelProfile,
    getWatchHistory,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
} from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
import { varifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()


router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(varifyJWT, logoutUser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(varifyJWT, changeCurrentPassword)

router.route("/current-user").get(varifyJWT, getCurrentUser)

router.route("/update-account-details").patch(varifyJWT, updateAccountDetails)

router.route("/update-avatar").patch(varifyJWT, upload.single("avatar"), updateUserAvatar)

router.route("/update-coverImage").patch(varifyJWT, upload.single("coverImage"), updateUserCoverImage)

router.route("/c/:username").get(varifyJWT, getUserChannelProfile)// hence it is an param so we shoul write"/name/:parameter_name"

router.route("/watchHistory").get(varifyJWT, getWatchHistory)

export default router

