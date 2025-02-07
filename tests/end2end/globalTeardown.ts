import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { testUser } from './authUtils';

dotenv.config();

export default async function globalTeardown() {
  await mongoose.connect(process.env.DB_URL!);
  await mongoose.connection.db?.collection('users').deleteOne({ email: testUser.email });
  console.log('User deleted');
  await mongoose.connection.close();
}
