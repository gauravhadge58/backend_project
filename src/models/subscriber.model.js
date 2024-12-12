import mongoose,{Schema} from "mongoose";

const subscriptionSchema = Schema(
    {
        subscriber: {
            //who is subscribing
            type: Schema.Types.ObjectId,
            ref: "User"
        },

        channel:{
            //channel owner is a user
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {timestamps:true}
)

export const Subscription = mongoose.model("Subscription",subscriptionSchema)