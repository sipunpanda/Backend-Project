import { v2 as cloudinary } from "cloudinary"
import fs from "fs"


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        // upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        //file has beeen uploaded sucessfully
        console.log("file uoloade on cloudinary");
        // console.log(response);
        // console.log(response.url);
        fs.unlinkSync(localFilePath)
        return response;

    }
    catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as upload got failed
        return null;
    }
}

const deleteFromCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null

        const response = await cloudinary.uploader.destroy(localFilePath, {
            resource_type: "auto"
        })

        return response
    }
    catch (error) {
        console.log(error);

        return null;
    }
}

export {
    uploadOnCloudinary,
    deleteFromCloudinary
}
