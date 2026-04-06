import mongoose from "mongoose";
const connectDb = async()=>{
    try{
        const conn = await mongoose.connect(process.env.MONGO_URL);
        console.log("connected to mongodb");
    }catch(err){
        console.error(`mongodb connection failed: ${err.message}`);
        process.exit(1);
    }
}

export default connectDb;