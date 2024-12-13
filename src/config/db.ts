import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Database connection established');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export default connectDB;
