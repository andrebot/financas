import chai from 'chai';
import sinonChai from 'sinon-chai';
import chaiHttp from 'chai-http';
import {
  connectToDatabase,
  createAdminUser,
  createAccount,
  createCategory,
  disconnectDatabase,
  account1,
  account2,
  account3,
  category1,
  category2,
  category3,
  adminUser,
} from './connectDB';
import { Types } from 'mongoose';

chai.use(sinonChai);
chai.use(chaiHttp);
chai.should();

before(async () => {
  await connectToDatabase();
  console.log('Database connected');
  await createAdminUser();
  console.log('Admin user created');
  await createAccount(account1, adminUser._id);
  await createAccount(account2, adminUser._id);
  await createAccount(account3, new Types.ObjectId());
  console.log('Accounts created');
  await createCategory(category1, adminUser._id);
  await createCategory(category2, adminUser._id);
  await createCategory(category3, new Types.ObjectId());
  console.log('Categories created');
});

after(async () => {
  await disconnectDatabase();
  console.log('Database disconnected.');
});
