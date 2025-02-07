import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { loginUser, resetPasswordUser } from './authUtils';

dotenv.config();

export default async function globalSetup() {
  await mongoose.connect(process.env.DB_URL!);
  await mongoose.connection.db?.collection('users').insertOne(loginUser);
  await mongoose.connection.db?.collection('users').insertOne(resetPasswordUser);
  await mongoose.connection.close();
}
