import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { loginUser, resetPasswordUser, testUser } from './authUtils';

dotenv.config();

export default async function globalTeardown() {
  await mongoose.connect(process.env.DB_URL!);
  await mongoose.connection.db?.collection('users').deleteOne({ email: testUser.email });
  await mongoose.connection.db?.collection('users').deleteOne({ email: loginUser.email });
  await mongoose.connection.db?.collection('users').deleteOne({ email: resetPasswordUser.email });
  console.log('Users deleted');
  await mongoose.connection.close();
}
