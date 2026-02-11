import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { loginUser, resetPasswordUser, testUser } from './authUtils';
import { changeEmailUser, changePasswordUser } from './settingsPageUtils';
import { bankAccountsUser } from './bankAccountsPageUtils';

dotenv.config();

export default async function globalTeardown() {
  await mongoose.connect(process.env.DB_URL || 'mongodb://localhost:27017/financas');
  const user = await mongoose.connection.db?.collection('users').findOne({ email: bankAccountsUser.email });

  if (user?._id) {
    await mongoose.connection.db?.collection('accounts').deleteMany({ user: user._id });
  }

  await mongoose.connection.db?.collection('users').deleteOne({ email: testUser.email });
  await mongoose.connection.db?.collection('users').deleteOne({ email: loginUser.email });
  await mongoose.connection.db?.collection('users').deleteOne({ email: resetPasswordUser.email });
  await mongoose.connection.db?.collection('users').deleteOne({ email: changeEmailUser.email });
  await mongoose.connection.db?.collection('users').deleteOne({ email: changePasswordUser.email });
  await mongoose.connection.db?.collection('users').deleteOne({ email: bankAccountsUser.email });
  await mongoose.connection.db?.collection('users').deleteMany({ email: { $regex: '.*delete.*@.*' } });

  console.log('Users deleted');

  await mongoose.connection.close();
}