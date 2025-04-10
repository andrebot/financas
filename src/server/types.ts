import jwt from 'jsonwebtoken';
import { Document } from 'mongoose';
import {
  Request, Response, NextFunction,
} from 'express';
import ContentManager, { Content } from './managers/contentManager';
import Repository from './resources/repositories/repository';
/* eslint-disable no-unused-vars */

/**
 * Interface for the Token
 */
export type Tokens = {
  /**
   * Access Token generated by the server
   */
  accessToken: string;
  /**
   * Refresh Token generated by the server
   */
  refreshToken: string;
};

/**
 * Interface for the Login Response
 */
export type LoginResponse = {
  /**
   * Access Token generated by the server
   */
  accessToken: string;
  /**
   * Refresh Token generated by the server
   */
  refreshToken: string;
  /**
   * User object
   */
  user: Omit<IUser, 'password'>;
};

/**
 * Interface for the Token
 */
export interface Token extends jwt.Jwt {
  /**
   * Payload of the token. It contains the email, role, first name and last name
   */
  payload: {
    /** Email of the user */
    email: string;
    /** Role of the user. Can be either 'admin' or 'user' */
    role: 'admin' | 'user';
    /** First name of the user */
    firstName: string;
    /** Last name of the user */
    lastName: string;
  }
}

/**
 * Interface for the User Payload
 */
export type UserPayload = {
  /** Email of the user */
  email?: string;
  /** First name of the user */
  firstName?: string;
  /** Last name of the user */
  lastName?: string;
  /** Role of the user. Can be either 'admin' or 'user' */
  role?: 'admin' | 'user';
  /** Id of the user */
  id?: string;
};

export interface RequestWithUser extends Request {
  user?: UserPayload;
}

/**
 * Interface for token validation middleware
 */
export type TokenValidationMiddleware = (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => void;

export interface IContentController {
  /**
   * Create content.
   *
   * @param req - The request object
   * @param res - The response object
   * @returns The created content
   */
  createContent(req: RequestWithUser, res: Response): Promise<Response>;
  /**
   * Update content. If the user is an admin, they can update any content.
   *
   * @param req - The request object
   * @param res - The response object
   * @returns The updated content
   */
  updateContent(req: RequestWithUser, res: Response): Promise<Response>;
  /**
   * Delete content by id. If the user is an admin, they can delete any content.
   * If the user is not an admin, they can only delete their own content.
   *
   * @param req - The request object
   * @param res - The response object
   * @returns The deleted content
   */
  deleteContent(req: RequestWithUser, res: Response): Promise<Response>;
  /**
   * List user content. If the user is an admin, they can list all content.
   *
   * @param req - The request object
   * @param res - The response object
   * @returns The list of content
   */
  listContent(req: RequestWithUser, res: Response): Promise<Response>;
  /**
   * Get content by id. If the user is an admin, they can get any content.
   *
   * @param req - The request object
   * @param res - The response object
   * @returns The content
   */
  getContent(req: RequestWithUser, res: Response): Promise<Response>;
}

export interface IBudgetController extends IContentController {
  /**
   * Get budget by id. If the user is an admin, they can get any budget.
   *
   * @param req - The request object
   * @param res - The response object
   * @returns The budget
   */
  getBudget(req: RequestWithUser, res: Response): Promise<Response>;
}

/**
 * Interface for the Card
 */
export interface ICard {
  /**
   * Id of the card
   */
  id?: string;
  /**
   * Number of the card
   */
  number: string;
  /**
   * Expiration date of the card
   */
  expirationDate: string;
}

/**
 * Interface for the Account
 */
export interface IAccount {
  /**
   * Id of the account
   */
  id?: string;
  /**
   * Name of the account
   */
  name: string;
  /**
   * Agency of the account
   */
  agency: string;
  /**
   * Account number
   */
  accountNumber: string;
  /**
   * Currency of the account
   */
  currency: string;
  /**
   * User of the account
   */
  user: string;
  /**
   * Cards of the account
   */
  cards: ICard[];
}

/**
 * Interface for the User
 */
export interface IUser {
  /**
   * Unique identifier of the user
   */
  id?: string; // Optional to account for new objects
  /**
   * Email of the user
   */
  email: string;
  /**
   * First name of the user
   */
  firstName: string;
  /**
   * Last name of the user
   */
  lastName: string;
  /**
   * Role of the user. Can be either 'admin' or 'user'
   */
  role: 'admin' | 'user';
  /**
   * Password of the user
   */
  password: string;
}

export enum TRANSACTION_TYPES {
  WITHDRAW = 'withdraw',
  DEPOSIT = 'deposit',
  TRANSFER = 'transfer',
  BANK_SLIP = 'bank_slip',
  CARD = 'card',
  INVESTMENT = 'investment',
}

export enum INVESTMENT_TYPES {
  CDB = 'cdb',
  LCI = 'lci',
  LCA = 'lca',
  STOCK = 'stock',
  FUND = 'fund',
  CRA = 'cra',
  CRI = 'cri',
  DEBENTURE = 'debenture',
  CURRENCY = 'currency',
  LC = 'lc',
  LF = 'lf',
  FII = 'fii',
  TRESURY = 'tresury',
}

export interface IGoalItem {
  goal: IGoal;
  goalName: string;
  percentage: number;
}

export interface ITransaction {
  id?: string;
  name: string;
  category: string;
  parentCategory: string;
  account: string;
  type: TRANSACTION_TYPES;
  date: Date | string;
  value: number;
  investmentType?: INVESTMENT_TYPES;
  user: string;
  goalsList: IGoalItem[];
}

export interface IGoal {
  /**
   * Unique identifier
   */
  id?: string;
  /**
   * Name of the Goal
   */
  name: string;
  /**
   * Goal's target value
   */
  value: number;
  /**
   * Due date for the goal
   */
  dueDate: Date;
  /**
   * Goal owner
   */
  user: string;
  /**
   * Saved value of the goal
   */
  savedValue: number;
}

export interface ICategory {
  /**
   * Unique identifier
   */
  id?: string;
  /**
   * Name of the category
   */
  name: string;
  /**
   * Category owner
   */
  user: string;
  /**
   * Parent category, if this is a sub-category
   */
  parentCategory?: string;
}

export enum BUDGET_TYPES {
  ANNUALY = 'annualy',
  QUARTERLY = 'quarterly',
  MONTHLY = 'monthly',
  WEEKLY = 'weekly',
  DAILY = 'daily',
}

export interface IBudget {
  /**
   * Unique identifier of the budget
   */
  id?: string;
  /**
   * Budget's name
   */
  name: string;
  /**
   * Budget's target value
   */
  value: number;
  /**
   * Budget type
   */
  type: BUDGET_TYPES;
  /**
   * Budget's spent value
   */
  spent?: number;
  /**
   * Budget's start date
   */
  startDate: Date;
  /**
   * Budget's end date
   */
  endDate: Date;
  /**
   * Categories related to this budget
   */
  categories: string[];
  /**
   * Budget owner
   */
  user: string;
}

export interface IMonthlyBalance {
  /**
   * Unique identifier
   */
  id?: string;
  /**
   * Monthly balance owner
   */
  user: string;
  /**
   * Monthly balance account
   */
  account: string;
  /**
   * Month of the monthly balance
   */
  month: number;
  /**
   * Year of the monthly balance
   */
  year: number;
  /**
   * Opening balance of the monthly balance
   */
  openingBalance: number;
  /**
   * Closing balance of the monthly balance
   */
  closingBalance: number;
  /**
   * Transactions of the monthly balance
   */
  transactions: ITransaction[];
}

export type BulkGoalsUpdate = {
  goalId: string;
  amount: number;
};

export type ErrorHandler = (error: Error) => void;

export type StandardRouteFactoryOptions<T extends Document, K extends Content> = {
  contentManager?: ContentManager<K>,
  repository?: Repository<T, K>,
};

/* eslint-enable no-unused-vars */
