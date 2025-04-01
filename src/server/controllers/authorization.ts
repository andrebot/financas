import { Request, Response } from 'express';
import { regExpEmail } from '../utils/validators';
import {
  createUser,
  updateUser,
  listUsers,
  deleteUser,
  login,
  logout,
  refreshTokens,
  resetPassword,
  changePassword,
  register,
  getUser,
} from '../managers/authenticationManager';
import { handleError, isValidObjectId } from '../utils/responseHandlers';
import { REFRESH_TOKEN_EXPIRATION_COOKIE, TOKEN_HTTPS_ONLY, REFRESH_TOKEN_COOKIE_NAME } from '../config/auth';
// import { API_PREFIX } from '../config/server';
import type { RequestWithUser, UserPayload } from '../types';
import Logger from '../utils/logger';

/**
 * Function to validate the delete action. An user can only delete their own account or
 * an admin can delete any account.
 *
 * @param req - The request object
 * @param res - The response object
 * @param userId - The id of the user to delete
 * @returns - True if the action is valid, false otherwise
 */
function isDeleteActionValid(req: RequestWithUser, res: Response, userId: string) {
  if (req.user?.role !== 'admin' && req.user?.id !== userId) {
    handleError(new Error('Current user does not have permission to delete this user'), res, 401);

    return false;
  }

  if (!userId || !isValidObjectId(userId)) {
    handleError(new Error('Invalid id'), res, 400);

    return false;
  }

  return true;
}

/**
 * Function to validate the login action. It will check if the email and password are valid
 *
 * @param email - The email of the user
 * @param password - The password of the user
 * @param res - The response object
 * @returns - True if the action is valid, false otherwise
 */
function isLoginActionValid(email: string, password: string, res: Response) {
  if (!email || !password || !regExpEmail.test(email)) {
    Logger.error(new Error('Invalid email or password'));

    return false;
  }

  return true;
}

/**
 * Function to validate the change password action. It will check if
 * the email and password are valid
 *
 * @param email - The email of the user
 * @param oldPassword - The old password of the user
 * @param newPassword - The new password of the user
 * @returns - True if the action is valid, false otherwise
 */
function isChangePasswordValid(
  user: UserPayload | undefined,
  oldPassword: string,
  newPassword: string,
) {
  if (!user || !user.email || !oldPassword || !newPassword) {
    return false;
  }

  return true;
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
 * Function to register a new user. It will create a new user and return the user and tokens
 *
 * @param req - The request object
 * @param res - The response object
 * @returns - The user and tokens as an object
 */
export async function registerController(req: Request, res: Response) {
  const {
    email,
    password,
    firstName,
    lastName,
  } = req.body;

  try {
    const { user, tokens } = await register(email, password, firstName, lastName);

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, tokens.refreshToken, {
      httpOnly: TOKEN_HTTPS_ONLY,
      secure: false,
      // sameSite: 'lax',
      // path: `${API_PREFIX}/refresh-tokens`,
      maxAge: REFRESH_TOKEN_EXPIRATION_COOKIE,
    });

    return res.send({ user, accessToken: tokens.accessToken });
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
export async function updateUserController(req: RequestWithUser, res: Response) {
  const {
    email,
    firstName,
    lastName,
  } = req.body;

  try {
    const user = await updateUser(
      req.user,
      req.params.userId,
      {
        email,
        firstName,
        lastName,
      },
    );

    return res.send(user);
  } catch (error) {
    let errorCode = 500;

    if ((error as Error).message === 'You do not have permission to update this user') {
      errorCode = 403;
    }

    return handleError(error as Error, res, errorCode);
  }
}

/**
 * Function to list all users
 *
 * @param req - The request object
 * @param res - The response object
 * @returns - The list of users as an object
 */
export async function listUsersController(req: Request, res: Response) {
  try {
    const users = await listUsers();

    return res.send(users);
  } catch (error) {
    return handleError(error as Error, res);
  }
}

/**
 * Function to get a user. It will return the user by id
 *
 * @param req - The request object
 * @param res - The response object
 * @returns - The user as an object
 */
export async function getUserController(req:Request, res: Response) {
  try {
    const user = await getUser(req.params.userId);

    return res.send(user);
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
export async function deleteUserController(
  req: RequestWithUser,
  res: Response,
): Promise<Response> {
  try {
    const { userId } = req.params;

    if (!isDeleteActionValid(req, res, userId)) {
      return res.status(403).json({ message: 'Unauthorized' });
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
export async function loginController(req: Request, res: Response): Promise<Response> {
  const {
    email,
    password,
  } = req.body;

  if (!isLoginActionValid(email, password, res)) {
    return res.status(400).send({ error: 'invalidUser' });
  }

  try {
    const { accessToken, refreshToken, user } = await login(email, password);

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      httpOnly: false,
      secure: false,
      // sameSite: 'lax',
      // path: `${API_PREFIX}/refresh-tokens`,
      maxAge: REFRESH_TOKEN_EXPIRATION_COOKIE,
    });

    return res.send({ accessToken, user });
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
export async function logoutController(req: Request, res: Response): Promise<Response> {
  try {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME];

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
export async function refreshTokensController(req: Request, res: Response): Promise<Response> {
  try {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME];

    if (!refreshToken) {
      return handleError(new Error('Empty refresh token'), res, 400);
    }

    const tokens = await refreshTokens(refreshToken);

    return res.send(tokens);
  } catch (error) {
    return handleError(error as Error, res);
  }
}

/**
 * Function to reset the password. It will send a new password to the user's email
 *
 * @param req - The request object
 * @param res - The response object
 * @returns - The message as an object
 */
export async function resetPasswordController(req: Request, res: Response): Promise<Response> {
  try {
    const { email } = req.body;

    if (!email || !regExpEmail.test(email)) {
      return handleError(new Error('Invalid email'), res, 400);
    }

    await resetPassword(email);

    return res.send({ message: `New password sent to ${email}` });
  } catch (error) {
    return handleError(error as Error, res);
  }
}

/**
 * Function to change the password. It will update the user's password
 *
 * @param req - The request object
 * @param res - The response object
 * @returns - The message as an object
 */
export async function changePasswordController(
  req: RequestWithUser,
  res: Response,
): Promise<Response> {
  const { oldPassword, newPassword } = req.body;

  if (!isChangePasswordValid(req.user, oldPassword, newPassword)) {
    return res.status(400).send({ error: 'Invalid old password or new password' });
  }

  try {
    await changePassword(req.user!.email!, oldPassword, newPassword);

    return res.send({ message: 'Password changed' });
  } catch (error) {
    return handleError(error as Error, res);
  }
}
