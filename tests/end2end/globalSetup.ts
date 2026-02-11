import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { loginUser, resetPasswordUser } from './authUtils';
import { changeEmailUser, changePasswordUser } from './settingsPageUtils';
import { bankAccountsUser } from './bankAccountsPageUtils';

dotenv.config();

export default async function globalSetup() {
  await mongoose.connect(process.env.DB_URL || 'mongodb://localhost:27017/financas');
  await mongoose.connection.db?.collection('users').insertOne(loginUser);
  await mongoose.connection.db?.collection('users').insertOne(resetPasswordUser);
  await mongoose.connection.db?.collection('users').insertOne(changeEmailUser);
  await mongoose.connection.db?.collection('users').insertOne(changePasswordUser);
  await mongoose.connection.db?.collection('users').insertOne(bankAccountsUser);
  await mongoose.connection.close();
}
