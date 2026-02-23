import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { loginUser, resetPasswordUser } from './authUtils';
import { changeEmailUser, changePasswordUser } from './settingsPageUtils';
import { bankAccountsUsers } from './bankAccountsPageUtils';
import { categoryUsers } from './categoriesPageUtils';
import { goalsUsers } from './goalsPageUtils';

dotenv.config();

export default async function globalSetup() {
  await mongoose.connect(process.env.DB_URL || 'mongodb://localhost:27017/financas');
  await mongoose.connection.db?.collection('users').insertOne(loginUser);
  await mongoose.connection.db?.collection('users').insertOne(resetPasswordUser);
  await mongoose.connection.db?.collection('users').insertOne(changeEmailUser);
  await mongoose.connection.db?.collection('users').insertOne(changePasswordUser);
  for (const user of Object.values(bankAccountsUsers)) {
    await mongoose.connection.db?.collection('users').insertOne(user);
  }
  for (const user of Object.values(categoryUsers)) {
    await mongoose.connection.db?.collection('users').insertOne(user);
  }
  for (const user of Object.values(goalsUsers)) {
    await mongoose.connection.db?.collection('users').insertOne(user);
  }
  await mongoose.connection.close();
}
