import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowecase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            rquired: true,
            unique: true,
            lowecase: true,
            trim: true
        },
        fullname: {
            type: String,
            required: true,
            index: true,
            trim: true
        },
        avatar: {
            type: String,
            required: true,

        },

        coverImage: {
            type: String
        },

        watchHistory: [{
            type: Schema.Type.ObjectId,
            ref: "Video"
        }],
        password: {
            type: String,
            required: [true, 'Password is Required!!']
        },
        refreshToken: {
            type: String
        }



    }, {
    timestamps: true
}
)

userSchema.pre('save', async function (next) {
    if (this.isModified("password")) {
        this.password = bcrypt.hash(this.password, 10)
        next()
    }
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
   await bcrypt.compare(password, this.password)
}



export const User = mongoose.model("User", userSchema)