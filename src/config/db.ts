import mongoose from 'mongoose';
import handleError from '../utils/handleError';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Database connection established');
  } catch (error) {
    console.log('Database connection error');
    handleError(error);
    process.exit(1);
  }
};

export default connectDB;
