import mongoose, { Schema } from "mongoose"

const subscriptionSchema = new Schema({
    subscriber:{
        type: Schema.Types.ObjectId, // who is subscribing
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId, // whome one who is subscribed to
        ref: "User"
    }
},{timestamps: true})




export const Subscription = mongoose.model("Subscription", subscriptionSchema)