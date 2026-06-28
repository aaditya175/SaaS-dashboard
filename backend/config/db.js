import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.set('toJSON', {
  virtuals: true,
  transform: (doc, converted) => {
    delete converted._id;
    delete converted.__v;
  }
});

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
