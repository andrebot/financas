import chai from 'chai';
import sinonChai from 'sinon-chai';
import {
  connectToDatabase,
  createAdminUser,
  createUserToDelete,
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
chai.should();

before(async () => {
  await connectToDatabase();
  console.log('Database connected');
  await createAdminUser();
  console.log('Admin user created');
  await createUserToDelete();
  console.log('User to delete created');
  await createAccount(account1, adminUser.id!);
  await createAccount(account2, adminUser.id!);
  await createAccount(account3, new Types.ObjectId().toString());
  console.log('Accounts created');
  await createCategory(category1, adminUser.id!, undefined);
  await createCategory(category2, adminUser.id!, undefined);
  await createCategory(category3, new Types.ObjectId().toString());
  console.log('Categories created');
  await createGoal(goal1, adminUser.id!);
  await createGoal(goal2, adminUser.id!);
  await createGoal(goal3, new Types.ObjectId().toString());
  console.log('Goals created');
  await createTransaction(transaction1, adminUser.id!, account1.id!);
  await createTransaction(transaction2, adminUser.id!, account1.id!);
  await createTransaction(transaction3, new Types.ObjectId().toString(), account2.id!);
  console.log('Transactions created');
  await createBudget(budget1, adminUser.id!);
  await createBudget(budget2, adminUser.id!);
  await createBudget(budget3, new Types.ObjectId().toString());
  console.log('Budgets created');
});

after(async () => {
  await disconnectDatabase();
  console.log('Database disconnected.');
});
