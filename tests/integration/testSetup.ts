import { should, use } from 'chai';
import sinonChai from 'sinon-chai';
import {
  connectToDatabase,
  disconnectDatabase,
  createAdminUser,
  createUserToDelete,
  createOtherUser,
  createAccount,
  createCategory,
  createGoal,
  createTransaction,
  createBudget,
  adminUser,
  otherUser,
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
} from './connectDB';

use(sinonChai);
should();

before(async () => {
  await connectToDatabase();
  console.log('Database connected');

  await createAdminUser();
  await createUserToDelete();
  await createOtherUser();
  console.log('Users created');

  await createAccount(account1, adminUser.id);
  await createAccount(account2, adminUser.id);
  await createAccount(account3, otherUser.id);
  console.log('Accounts created');

  await createCategory(category1, adminUser.id);
  await createCategory(category2, adminUser.id);
  await createCategory(category3, otherUser.id);
  console.log('Categories created');

  await createGoal(goal1, adminUser.id);
  await createGoal(goal2, adminUser.id);
  await createGoal(goal3, otherUser.id);
  console.log('Goals created');

  await createTransaction(transaction1, adminUser.id, account1.id);
  await createTransaction(transaction2, adminUser.id, account1.id);
  await createTransaction(transaction3, otherUser.id, account3.id);
  console.log('Transactions created');

  await createBudget(budget1, adminUser.id, [category1.id]);
  await createBudget(budget2, adminUser.id, [category1.id]);
  await createBudget(budget3, otherUser.id, []);
  console.log('Budgets created');
});

after(async () => {
  await disconnectDatabase();
  console.log('Database disconnected.');
});
