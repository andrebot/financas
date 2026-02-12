import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { loginUser, resetPasswordUser, testUser } from './authUtils';
import { changeEmailUser, changePasswordUser } from './settingsPageUtils';
import { bankAccountsUsers } from './bankAccountsPageUtils';

dotenv.config();

export default async function globalTeardown() {
  await mongoose.connect(process.env.DB_URL || 'mongodb://localhost:27017/financas');

  for (const user of Object.values(bankAccountsUsers)) {
    const dbUser = await mongoose.connection.db?.collection('users').findOne({ email: user.email });
    if (dbUser?._id) {
      await mongoose.connection.db?.collection('accounts').deleteMany({ user: dbUser._id });
    }
    await mongoose.connection.db?.collection('users').deleteOne({ email: user.email });
  }

  await mongoose.connection.db?.collection('users').deleteOne({ email: testUser.email });
  await mongoose.connection.db?.collection('users').deleteOne({ email: loginUser.email });
  await mongoose.connection.db?.collection('users').deleteOne({ email: resetPasswordUser.email });
  await mongoose.connection.db?.collection('users').deleteOne({ email: changeEmailUser.email });
  await mongoose.connection.db?.collection('users').deleteOne({ email: changePasswordUser.email });
  await mongoose.connection.db?.collection('users').deleteMany({ email: { $regex: '.*delete.*@.*' } });

  console.log('Users deleted');

  await mongoose.connection.close();
}