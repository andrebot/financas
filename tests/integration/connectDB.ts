import mongoose, { Types } from 'mongoose';
import bcrypt from 'bcrypt';
import { MongoMemoryServer } from 'mongodb-memory-server';
import UserModel, { IUser } from '../../src/server/resources/userModel';
import AccountModel, { IAccount } from '../../src/server/resources/accountModel';

export const adminUser = {
  email: 'admin@example.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin',
} as IUser;
let mongoServer: MongoMemoryServer;

export const account1 = {
  name: 'Test Account 1',
  agency: '1234',
  accountNumber: '123456',
  currency: 'BRL',
  cards: [
    {
      number: '1234567890123456',
      expirationDate: '12/2024',
    },
  ],
} as IAccount;
export const account2 = {
  name: 'Test Account 2',
  agency: '5678',
  accountNumber: '567890',
  currency: 'USD',
  cards: [
    {
      number: '6543210987654321',
      expirationDate: '12/2024',
    },
  ],
} as IAccount;
export const account3 = {
  name: 'Test Account 3',
  agency: '5678',
  accountNumber: '567890',
  currency: 'USD',
  cards: [
    {
      number: '6543210987654321',
      expirationDate: '12/2024',
    },
  ],
} as IAccount;

// Establish a connection to the in-memory database
export const connectToDatabase = async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
  console.log('connected to database');
};

// Disconnect and stop the server
export const disconnectDatabase = async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
};

export const createAdminUser = async () => {
  adminUser.password = await bcrypt.hash('adminPassword', bcrypt.genSaltSync(10));
  const savedUSer: IUser = new UserModel(adminUser)

  await savedUSer.save();
  adminUser._id = savedUSer._id;
};

export const createAccount = async (account: IAccount, userID: Types.ObjectId) => {
  const newAccount = new AccountModel({
    ...account,
    user: userID,
  });
  await newAccount.save();

  account._id = newAccount._id;
};
