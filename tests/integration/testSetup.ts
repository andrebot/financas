import chai from 'chai';
import sinonChai from 'sinon-chai';
import chaiHttp from 'chai-http';
import {
  connectToDatabase,
  createAdminUser,
  createAccount,
  createCategory,
  createTransaction,
  createBudget,
  createGoal,
  disconnectDatabase,
  account1,
  account2,
  account3,
  category1,
  category2,
  category3,
  goal1,
  goal2,
  goal3,
  budget1,
  budget2,
  budget3,
  transaction1,
  transaction2,
  transaction3,
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
  await createGoal(goal1, adminUser._id);
  await createGoal(goal2, adminUser._id);
  await createGoal(goal3, new Types.ObjectId());
  console.log('Goals created');
  await createTransaction(transaction1, adminUser._id, account1._id);
  await createTransaction(transaction2, adminUser._id, account1._id);
  await createTransaction(transaction3, new Types.ObjectId(), account2._id);
  console.log('Transactions created');
  await createBudget(budget1, adminUser._id);
  await createBudget(budget2, adminUser._id);
  await createBudget(budget3, new Types.ObjectId());
  console.log('Budgets created');
});

after(async () => {
  await disconnectDatabase();
  console.log('Database disconnected.');
});
