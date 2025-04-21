import mongoose from "mongoose";

export const connectDb = async()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.DB_URL}/tokenizer`)
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection FAILED ", error);
        process.exit(1)
    }
}