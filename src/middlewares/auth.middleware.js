import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

export const varifyJWT = asyncHandler(async(req,res,next)=>{
 try {
      const token =  req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
   
       if(!token){
           throw new ApiError(401, "Unauthorized Requeat")
       }
   
       const decodedToken = jwt.varify(token, process.env.ACCESS_TOKEN_SECRET)
   
      const user =  await User.findById(decodedToken?._id).select(
           "-password -refreshToken")
   
           if(!user){
               //
               throw new ApiError(401, "Invalid Access Token")
               
           }
   
           req.user = user;
           next()
 } catch (error) {
    throw new ApiError(401, error?.message || "invalid Access to Token")
 }
})