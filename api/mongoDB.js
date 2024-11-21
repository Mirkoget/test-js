import mongoose from 'mongoose';
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    const dbURI = `mongodb+srv://rudanskivany:RZbSs7tJSTayrVdP@test-market-place.0wj4x.mongodb.net/`;
    
    mongoose.connect(`${dbURI}`);


    console.log("MongoDB подключен успешно");
  } catch (error) {
    console.error("Ошибка подключения к MongoDB", error.message);
    process.exit(1);
  }
};
export default connectDB;