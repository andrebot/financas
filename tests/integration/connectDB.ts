import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { MongoMemoryServer } from 'mongodb-memory-server';
import UserModel, { IUser } from '../../src/server/resources/userModel';

export const adminUser = {
  email: 'admin@example.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin',
} as IUser;
let mongoServer: MongoMemoryServer;

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
  adminUser.password = await bcrypt.hash('adminPassword', 10);
  const savedUSer: IUser = new UserModel(adminUser);

  await savedUSer.save();
  adminUser._id = savedUSer._id;
  console.log('admin user created');
};
