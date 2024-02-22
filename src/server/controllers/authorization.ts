import { Request, Response } from 'express';
import { Types } from 'mongoose';
import logger from '../utils/logger';
import { regExpEmail } from '../utils/validators';
import {
  createUser, updateUser, listUsers, deleteUser, login, logout, refreshTokens,
} from '../managers/authenticationManager';

/**
 * Function to handle errors. It will log the error and return a response with
 * the error message and status.
 *
 * @param error - The error to be handled
 * @param res - The response object
 * @param status - The status to be returned. Default is 500
 * @returns - The response with the error message and status
 */
function handleError(error: Error, res: Response, status = 500) {
  logger.error(error);

  return res.status(status).send({ error: error.message });
}

/**
 * Validates if a string is a valid Mongoose ObjectId.
 *
 * @param {string} id The string to validate as a Mongoose ObjectId.
 * @returns {boolean} True if the string is a valid ObjectId, false otherwise.
 */
function isValidObjectId(id: string): boolean {
  return Types.ObjectId.isValid(id) && new Types.ObjectId(id).toString() === id;
}

/**
 * Function to create a user. It will create a new user with the provided data
 *
 * @param req - The request object
 * @param res - The response object
 * @returns - The user as an object
 */
export async function createUserController(req: Request, res: Response) {
  const {
    email,
    password,
    firstName,
    lastName,
  } = req.body;

  try {
    const user = await createUser(
      email,
      password,
      firstName,
      lastName,
    );

    return res.send(user);
  } catch (error) {
    return handleError(error as Error, res);
  }
}

/**
 * Function to update a user. It will find the user by id and update it
 *
 * @param req - The request object
 * @param res - The response object
 * @returns - The user as an object
 */
export async function updateUserController(req: Request, res: Response) {
  const {
    email,
    firstName,
    lastName,
  } = req.body;

  try {
    const user = await updateUser(
      req.params.id,
      {
        email,
        firstName,
        lastName,
      },
    );

    return res.send(user);
  } catch (error) {
    return handleError(error as Error, res);
  }
}

/**
 * Function to list users. It will return a list of users based on the query parameters
 *
 * @param req - The request object
 * @param res - The response object
 * @returns - The list of users as an object
 */
export async function listUsersController(req: Request, res: Response) {
  try {
    const users = await listUsers(req.query);

    return res.send(users);
  } catch (error) {
    return handleError(error as Error, res);
  }
}

/**
 * Function to delete a user. It will find the user by id and delete it
 *
 * @param req - The request object
 * @param res - The response object
 * @returns - The message as an object
 */
export async function deleteUserController(req: Request, res: Response) {
  try {
    const userId = req.params.id;

    if (!userId || !isValidObjectId(userId)) {
      return handleError(new Error('Invalid id'), res, 400);
    }

    await deleteUser(userId);

    return res.send({ message: `User deleted: id ${userId}` });
  } catch (error) {
    return handleError(error as Error, res);
  }
}

/**
 * Function to login. It will return the access and refresh tokens
 *
 * @param req - The request object
 * @param res - The response object
 * @returns - The tokens as an object
 */
export async function loginController(req: Request, res: Response) {
  const {
    email,
    password,
  } = req.body;

  if (!email || !password || !regExpEmail.test(email)) {
    return handleError(new Error('Invalid email or password'), res, 400);
  }

  try {
    const tokens = await login(email, password);

    return res.send(tokens);
  } catch (error) {
    return handleError(error as Error, res);
  }
}

/**
 * Function to logout. It will revoke the refresh token
 *
 * @param req - The request object
 * @param res - The response object
 * @returns - The message as an object
 */
export async function logoutController(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return handleError(new Error('Empty refresh token'), res, 400);
    }

    await logout(refreshToken);

    return res.send({ message: 'Logged out' });
  } catch (error) {
    return handleError(error as Error, res);
  }
}

/**
 * Function to refresh the access token using the refresh token
 *
 * @param req - The request object
 * @param res - The response object
 * @returns - The tokens as an object
 */
export async function refreshTokensController(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return handleError(new Error('Empty refresh token'), res, 400);
    }

    const tokens = await refreshTokens(refreshToken);

    return res.send(tokens);
  } catch (error) {
    return handleError(error as Error, res);
  }
}
