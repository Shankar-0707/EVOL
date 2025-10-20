import mongoose, { mongo } from "mongoose";

const connectDb = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDb is Connected`)
    }
    catch(error){
        console.log(`MongoDB Connection Error`);
        process.exit(1);
    }
}

export default connectDb;