import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { FilterQuery } from 'mongoose';
import UserModel, { IUser } from '../resources/userModel';
import { addToken, deleteToken, isValidToken } from '../resources/tokenModel';
import { regExpPassword } from '../utils/validators';
import { Tokens, Token, UserPayload } from '../types';
import Logger from '../utils/logger';
import {
  WORK_FACTOR,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  ISSUER,
  ACCESS_TOKEN_EXPIRATION,
  REFRESH_TOKEN_EXPIRATION,
} from '../config/auth';
import sendNotification from '../utils/notification';

/**
 * Function to create a token
 *
 * @param payload - Object to be added to the token
 * @param expiresIn - Time for the token to expire
 * @param secret - Secret to be used to create the token
 * @returns - the Token as a string
 */
export function createToken(payload: UserPayload, expiresIn: string, secret: string): string {
  return jwt.sign(payload, secret, { issuer: ISSUER, expiresIn });
}

/**
 * Function to create an access token
 *
 * @param email - Email of the user to be added to the token
 * @param role - Role of the user to be added to the token
 * @param firstName - First name of the user to be added to the token
 * @param lastName - Last name of the user to be added to the token
 * @returns - the Access Token as a string
 */
export function createAccessToken(
  email: string,
  role: 'admin' | 'user',
  firstName: string,
  lastName: string,
): string {
  return createToken({
    email,
    role,
    firstName,
    lastName,
  }, ACCESS_TOKEN_EXPIRATION, ACCESS_TOKEN_SECRET);
}

/**
 * Function to create a refresh token
 *
 * @param email - Email of the user to be added to the token
 * @returns - the Refresh Token as a string
 */
export function createRefreshToken(email: string): string {
  return createToken({ email }, REFRESH_TOKEN_EXPIRATION, REFRESH_TOKEN_SECRET);
}

/**
 * Function to create a user. It will hash the password and add the user to the database
 *
 * @throws - Error if any of the fields are missing or invalid
 *
 * @param email - Email of the user to be added to the database
 * @param password - Password of the user to be added to the database
 * @param firstName - First name of the user to be added to the database
 * @param lastName - Last name of the user to be added to the database
 * @param role - Role of the user to be added to the database
 * @returns - the User as an object
 */
export async function createUser(email: string, password: string, firstName: string, lastName: string, role = 'user'): Promise<IUser> {
  if (regExpPassword.test(password)) {
    const salt = bcrypt.genSaltSync(WORK_FACTOR);
    const newUser = new UserModel({
      email,
      password: bcrypt.hashSync(password, salt),
      firstName,
      lastName,
      role,
    });

    await newUser.save();

    return newUser.toObject();
  }
  throw new Error('Password does not follow the rules');
}

/**
 * Function to update a user. It will find the user by id and update the information provided
 *
 * @throws - Error if the user is not an admin and is trying to update another user
 * @throws - Error if no information is provided to be updated
 * @throws - Error if the user is not found
 *
 * @param id - Id of the user to be updated
 * @param payload - Information to be updated
 * @returns - the User as an object
 */
export async function updateUser(
  requestingUser: UserPayload | undefined,
  id: string,
  payload: UserPayload,
): Promise<IUser> {
  const user = await UserModel.findById(id);

  if (!user) {
    throw new Error('User not found');
  }

  if (!requestingUser || (requestingUser.role !== 'admin' && requestingUser.email !== user.email)) {
    throw new Error('You do not have permission to update this user');
  }

  if (!payload || (!payload.email && !payload.firstName && !payload.lastName)) {
    throw new Error('No information provided to be updated');
  }

  const {
    email,
    firstName,
    lastName,
  } = payload;

  if (email) {
    user.email = email;
  }

  if (firstName) {
    user.firstName = firstName;
  }

  if (lastName) {
    user.lastName = lastName;
  }

  await user.save();

  return user.toObject();
}

/**
 * Function to list users. It will find the users based on the query provided
 *
 * @param query - Query to be used to find the users
 * @returns - the Users as an array
 */
export function listUsers(query: FilterQuery<IUser> = {}): Promise<IUser[]> {
  return UserModel.find(query);
}

/**
 * Function to delete a user. It will find the user by id and delete it
 *
 * @throws - Error if the user is not found
 *
 * @param id - Id of the user to be deleted
 * @returns - the User as an object
 */
export async function deleteUser(id: string): Promise<IUser> {
  return UserModel.findByIdAndDelete(id).then((deletedUser) => {
    if (!deletedUser) {
      throw new Error(`User not found ${id}`);
    }

    return deletedUser.value as IUser;
  });
}

/**
 * Function to login. It will find the user by email and compare the password provided
 *
 * @throws - Error if the password does not match
 * @throws - Error if the user is not found
 *
 * @param searchEmail - Email of the user to be found
 * @param password - Password of the user to be compared
 * @returns - the Tokens as an object
 */
export async function login(searchEmail: string, password: string): Promise<Tokens> {
  const user = await UserModel.findOne({ searchEmail });

  if (user) {
    const isMatch = bcrypt.compareSync(password, user.password);
    const {
      email,
      role,
      firstName,
      lastName,
    } = user;

    if (isMatch) {
      const accessToken = createAccessToken(email, role, firstName, lastName);
      const refreshToken = createRefreshToken(email);

      addToken(refreshToken);

      return {
        accessToken,
        refreshToken,
      };
    }
    throw new Error('Password was not a match');
  }

  throw new Error('User not found');
}

/**
 * Function to logout. It will delete the token from the database.
 *
 * @param refreshToken - Refresh Token to be deleted
 * @returns - a boolean
 */
export async function logout(refreshToken: string): Promise<boolean> {
  let verification = false;

  try {
    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, { complete: true }) as Token;

    verification = true;
  } catch (error) {
    Logger.error('Failed to verify token. Invalidating it anyway.');
    Logger.error(error);
  } finally {
    deleteToken(refreshToken);
  }

  return verification;
}

/**
 * Function to refresh tokens. It will verify the token and create new
 * access and refresh tokens
 *
 * @throws - Error if the token is not valid
 * @throws - Error if the user is not found
 *
 * @param refreshToken - Refresh Token to be verified
 * @returns - the Tokens as an object
 */
export async function refreshTokens(refreshToken: string): Promise<Tokens> {
  if (isValidToken(refreshToken)) {
    const tokenDecrypted = jwt.verify(
      refreshToken,
      REFRESH_TOKEN_EXPIRATION,
      { complete: true },
    ) as Token;
    const user = await UserModel.findOne({ email: tokenDecrypted.payload.email });

    if (user) {
      const {
        email,
        firstName,
        lastName,
        role,
      } = user;

      return {
        accessToken: createAccessToken(email, role, firstName, lastName),
        refreshToken: createRefreshToken(email),
      };
    }
    throw new Error(`No user was found with email: ${tokenDecrypted.payload.email}`);
  } else {
    throw new Error('Token is not valid');
  }
}

/**
 * Function to reset password. It will find the user by email and create a new password.
 * It will send the new password to the user's email.
 *
 * @throws - Error if the user is not found
 *
 * @param email - Email of the user to be found
 * @returns - if the password was reset
 */
export async function resetPassword(email: string): Promise<boolean> {
  const user = await UserModel.findOne({ email });

  if (user) {
    const newPassword = Math.random().toString(36).slice(-8);
    const salt = bcrypt.genSaltSync(WORK_FACTOR);

    user.password = bcrypt.hashSync(newPassword, salt);
    await user.save();

    sendNotification(email, `Your new password is: ${newPassword}`);

    return true;
  }
  throw new Error(`No user was found with email: ${email}`);
}

/**
 * Function to change password. It will find the user by email and compare the old password
 * to the one in the database. If it matches, it will create a new password.
 *
 * @throws - Error if the password does not match
 *
 * @param email - Email of the user to be found
 * @param oldPassword - Old password of the user to be compared
 * @param newPassword - New password of the user to be created
 * @returns - if the password was changed
 */
export async function changePassword(
  email: string,
  oldPassword: string,
  newPassword: string,
): Promise<boolean> {
  const user = await UserModel.findOne({ email });

  if (user) {
    const isMatch = bcrypt.compareSync(oldPassword, user.password);

    if (isMatch) {
      const salt = bcrypt.genSaltSync(WORK_FACTOR);
      user.password = bcrypt.hashSync(newPassword, salt);
      await user.save();

      return true;
    }
  }

  return false;
}
