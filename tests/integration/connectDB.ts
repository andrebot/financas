import mongoose, { Types } from 'mongoose';
import bcrypt from 'bcrypt';
import { MongoMemoryServer } from 'mongodb-memory-server';
import UserModel, { IUserDocument } from '../../src/server/resources/models/userModel';
import AccountModel, { IAccountDocument } from '../../src/server/resources/models/accountModel';
import categoryModel, { ICategoryDocument } from '../../src/server/resources/models/categoryModel';
import GoalModel, { IGoalDocument } from '../../src/server/resources/models/goalModel';
import BudgetModel, { IBudgetDocument } from '../../src/server/resources/models/budgetModel';
import transactionModel, { ITransactionDocument } from '../../src/server/resources/models/transactionModel';
import {
  IUser,
  IAccount,
  ICategory,
  IGoal,
  IBudget,
  ITransaction,
  BUDGET_TYPES,
  TRANSACTION_TYPES,
  INVESTMENT_TYPES,
} from '../../src/server/types';

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
export const category1 = {
  name: 'Test Category 1',
} as ICategory;
export const category2 = {
  name: 'Test Category 2',
} as ICategory;
export const category3 = {
  name: 'Test Category 3',
} as ICategory;
export const goal1 = {
  name: 'Test Goal 1',
  value: 100,
  dueDate: new Date(),
} as IGoal;
export const goal2 = {
  name: 'Test Goal 2',
  value: 200,
  dueDate: new Date(),
} as IGoal;
export const goal3 = {
  name: 'Test Goal 3',
  value: 300,
  dueDate: new Date(),
} as IGoal;
export const budget1 = {
  name: 'Test Budget 1',
  value: 100,
  type: BUDGET_TYPES.MONTHLY,
  startDate: new Date(),
  endDate: new Date(),
  categories: ['Test Category 1'],
} as IBudget;
export const budget2 = {
  name: 'Test Budget 2',
  value: 100,
  type: BUDGET_TYPES.ANNUALY,
  startDate: new Date(),
  endDate: new Date(),
  categories: ['Test Category 1'],
} as IBudget;
export const budget3 = {
  name: 'Test Budget 3',
  value: 100,
  type: BUDGET_TYPES.QUARTERLY,
  startDate: new Date(),
  endDate: new Date(),
  categories: ['Test Category 1'],
} as IBudget;
export const transaction1 = {
  name: 'Test Transaction 1',
  category: 'Test Category 1',
  parentCategory: 'Test Parent Category 1',
  type: TRANSACTION_TYPES.WITHDRAW,
  date: new Date(),
  value: 100,
  isCredit: false,
} as ITransaction;
export const transaction2 = {
  name: 'Test Transaction 2',
  category: 'Test Category 2',
  parentCategory: 'Test Parent Category 2',
  type: TRANSACTION_TYPES.INVESTMENT,
  date: new Date(),
  value: 200,
  isCredit: false,
  investmentType: INVESTMENT_TYPES.LCI,
  goalsList: [{
    goal: new mongoose.Types.ObjectId().toString(),
    goalName: 'Test Goal 1',
    percentage: 0.5,
  }],
} as ITransaction;
export const transaction3 = {
  name: 'Test Transaction 3',
  category: 'Test Category 3',
  parentCategory: 'Test Parent Category 3',
  type: TRANSACTION_TYPES.INVESTMENT,
  date: new Date(),
  value: 300,
  isCredit: false,
  investmentType: INVESTMENT_TYPES.LCA,
  goalsList: [{
    goal: new mongoose.Types.ObjectId().toString(),
    goalName: 'Test Goal 2',
    percentage: 0.5,
  }],
} as ITransaction;

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
  const savedUSer: IUserDocument = new UserModel(adminUser)

  await savedUSer.save();
  adminUser.id = savedUSer._id.toString();
};

export const createAccount = async (account: IAccount, userID: string) => {
  const newAccount: IAccountDocument = new AccountModel({
    ...account,
    user: userID,
  });
  await newAccount.save();

  account.id = newAccount._id.toString();
};

export const createCategory = async (category: ICategory, userID: string, parentCategory?: string) => {
  const newCategory: ICategoryDocument = new categoryModel({
    ...category,
    user: userID,
    parentCategory,
  });
  await newCategory.save();

  category.id = newCategory._id.toString();
};

export const createGoal = async (goal: IGoal, userID: string) => {
  const newGoal: IGoalDocument = new GoalModel({
    ...goal,
    user: userID,
  });
  await newGoal.save();

  goal.id = newGoal._id.toString();
};

export const createTransaction = async (transaction: ITransaction, userID: string, accountID: string) => {
  const newTransaction: ITransactionDocument = new transactionModel({
    ...transaction,
    user: userID,
    account: accountID,
  });
  await newTransaction.save();

  transaction.id = newTransaction._id.toString();
}

export const createBudget = async (budget: IBudget, userID: string) => {
  const newBudget: IBudgetDocument = new BudgetModel({
    ...budget,
    user: userID,
  });
  await newBudget.save();

  budget.id = newBudget._id.toString();
};
