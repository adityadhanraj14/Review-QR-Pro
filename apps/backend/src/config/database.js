import mongoose from 'mongoose';
import { config } from './index.js';
import { seedSuperAdmin } from './seed.js';

export const connectDatabase = async () => {
  if (!config.mongodbUri) {
    throw new Error('MONGODB_URI is required');
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(config.mongodbUri);
  await seedSuperAdmin();
};
