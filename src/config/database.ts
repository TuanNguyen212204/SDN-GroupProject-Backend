import mongoose from 'mongoose';
import { logger } from '../utils/logger.util';

export async function connectMongo(): Promise<void> {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mma';
  
  try {
    await mongoose.connect(uri, {
      // Options để kết nối ổn định hơn
      maxPoolSize: 10, // Số connection tối đa trong pool
      serverSelectionTimeoutMS: 5000, // Timeout chọn server
      socketTimeoutMS: 45000, // Timeout socket
    });
    logger.info(`MongoDB connected: ${uri.replace(/\/\/.*@/, '//***@')}`); // Ẩn password nếu có
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    throw error;
  }
}

