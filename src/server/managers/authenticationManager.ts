import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken';
import {
  Tokens, Token, UserPayload,
} from '../types';
import UserRepo from '../resources/repositories/userRepo';
import { regExpPassword } from '../utils/validators';
import { createLogger } from '../utils/logger';
import {
  WORK_FACTOR,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  ISSUER,
  ACCESS_TOKEN_EXPIRATION,
  REFRESH_TOKEN_EXPIRATION,
} from '../config/auth';
import sendNotification from '../utils/notification';
import type { IUser, LoginResponse } from '../types';

const logger = createLogger('AuthenticationManager');

/**
 * Function to create a token
 *
 * @param payload - Object to be added to the token
 * @param expiresIn - Time for the token to expire
 * @param secret - Secret to be used to create the token
 * @returns - the Token as a string
 */
export function createToken(payload: UserPayload, expiresIn: number, secret: Secret): string {
  return jwt.sign(payload, secret, { issuer: ISSUER, expiresIn });
}

/**
 * Function to create an access token
 *
 * @param email - Email of the user to be added to the token
 * @param role - Role of the user to be added to the token
 * @param firstName - First name of the user to be added to the token
 * @param lastName - Last name of the user to be added to the token
 * @param id - Id of the user to be added to the token
 * @returns - the Access Token as a string
 */
export function createAccessToken(
  email: string,
  role: 'admin' | 'user',
  firstName: string,
  lastName: string,
  id: string,
): string {
  return createToken({
    email,
    role,
    firstName,
    lastName,
    id,
  }, ACCESS_TOKEN_EXPIRATION, ACCESS_TOKEN_SECRET);
}

/**
 * Function to create a refresh token
 *
 * @param email - Email of the user to be added to the token
 * @param role - Role of the user to be added to the token
 * @param firstName - First name of the user to be added to the token
 * @param lastName - Last name of the user to be added to the token
 * @param id - Id of the user to be added to the token
 * @returns - the Refresh Token as a string
 */
export function createRefreshToken(email: string, role: 'admin' | 'user', firstName: string, lastName: string, id: string): string {
  return createToken({
    email, role, firstName, lastName, id,
  }, REFRESH_TOKEN_EXPIRATION, REFRESH_TOKEN_SECRET);
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
export async function createUser(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  role: 'admin' | 'user' = 'user',
): Promise<Omit<IUser, 'password'>> {
  if (regExpPassword.test(password)) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...newUser } = await UserRepo.save({
      email,
      password: bcrypt.hashSync(password, bcrypt.genSaltSync(WORK_FACTOR)),
      firstName,
      lastName,
      role,
    });

    return newUser;
  }

  throw new Error('Password does not follow the rules');
}

/**
 * Function to validate the update user. It will check if the user is an admin and if the user
 * is trying to update another user
 *
 * @throws - Error if the user is not an admin and is trying to update another user
 * @throws - Error if the user is not found
 * @throws - Error if no information is provided to be updated
 *
 * @param requestingUser - The user that is requesting the update
 * @param user - The user to be updated
 * @param payload - The payload to be updated
 */
function validateUpdateUser(
  requestingUser: UserPayload | undefined,
  user: IUser | null,
  payload: UserPayload,
) {
  if (!user) {
    throw new Error('User not found');
  }

  if (!requestingUser || (requestingUser.role !== 'admin' && requestingUser.email !== user.email)) {
    throw new Error('You do not have permission to update this user');
  }

  if (!payload || (!payload.email && !payload.firstName && !payload.lastName)) {
    throw new Error('No information provided to be updated');
  }
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
): Promise<Omit<IUser, 'password'>> {
  const user = await UserRepo.findById(id);

  validateUpdateUser(requestingUser, user, payload);

  const {
    email,
    firstName,
    lastName,
  } = payload;

  if (email) {
    user!.email = email;
  }

  if (firstName) {
    user!.firstName = firstName;
  }

  if (lastName) {
    user!.lastName = lastName;
  }

  // user is always not null because we checked for it above
  const updatedUser = await UserRepo.update(id, user!);

  return {
    id: updatedUser!.id,
    email: updatedUser!.email,
    firstName: updatedUser!.firstName,
    lastName: updatedUser!.lastName,
    role: updatedUser!.role,
  };
}

/**
 * Function to list users. It will find the users based on the query provided
 *
 * @param query - Query to be used to find the users
 * @returns - the Users as an array
 */
export function listUsers(): Promise<IUser[]> {
  return UserRepo.listAll();
}

/**
 * Function to get a user. It will find the user by id
 *
 * @param id - Id of the user to be found
 * @returns - the User as an object
 */
export function getUser(id: string): Promise<IUser | null> {
  return UserRepo.findById(id);
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
  return UserRepo.findByIdAndDelete(id).then((deletedUser) => {
    if (!deletedUser) {
      throw new Error(`User not found ${id}`);
    }

    return deletedUser;
  });
}

/**
 * Function to register a user. It will create a new user and return the user and tokens
 *
 * @throws - Error if creating the user fails
 *
 * @param email - Email of the user to be registered
 * @param password - Password of the user to be registered
 * @param firstName - First name of the user to be registered
 * @param lastName - Last name of the user to be registered
 * @returns - the User and Tokens as an object
 */
export async function register(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
): Promise<{ user: Omit<IUser, 'password'>, tokens: Tokens }> {
  const role = 'user';
  const newUser = await createUser(email, password, firstName, lastName, role);
  const accessToken = createAccessToken(email, role, firstName, lastName, newUser.id!);
  const refreshToken = createRefreshToken(email, role, firstName, lastName, newUser.id!);

  return {
    user: newUser,
    tokens: {
      accessToken,
      refreshToken,
    },
  };
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
export async function login(searchEmail: string, password: string): Promise<LoginResponse> {
  logger.info(`Logging in user: ${searchEmail}`);
  const user = await UserRepo.findByEmail(searchEmail);

  if (user) {
    logger.info('User found, validating password');

    const isMatch = bcrypt.compareSync(password, user.password);
    const {
      email,
      role,
      firstName,
      lastName,
      id,
    } = user;

    if (isMatch) {
      logger.info('Password matches, creating tokens');

      const accessToken = createAccessToken(email, role, firstName, lastName, id!);
      const refreshToken = createRefreshToken(email, role, firstName, lastName, id!);

      logger.info('Tokens created, returning response');

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      };
    }

    logger.error(new Error(`Password was not a match for user: ${email}`));
    throw new Error('invalidUser');
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
  logger.info(`Logging out user: ${refreshToken}`);

  let verification = false;

  try {
    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, { complete: true }) as Token;

    logger.info('Token verified, deleting token');

    verification = true;
  } catch (error) {
    logger.error('Failed to verify token. Invalidating it anyway.');
    logger.error(error);
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
  const tokenDecrypted = jwt.verify(
    refreshToken,
    REFRESH_TOKEN_SECRET,
  ) as UserPayload;
  const user = await UserRepo.findByEmail(tokenDecrypted.email!);

  if (user) {
    const {
      email,
      firstName,
      lastName,
      role,
      id,
    } = user;

    logger.info(`Refreshing tokens for user: ${email}`);

    return {
      accessToken: createAccessToken(email, role, firstName, lastName, id!),
      refreshToken: createRefreshToken(email, role, firstName, lastName, id!),
    };
  }

  throw new Error(`Token invalid since its from non-existent user: ${tokenDecrypted.email}`);
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
  const user = await UserRepo.findByEmail(email);

  if (user) {
    const newPassword = Math.random().toString(36).slice(-8);

    logger.info(`Resetting password for user: ${email}`);

    user.password = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(WORK_FACTOR));
    await UserRepo.update(user.id!, user);

    sendNotification(email, `Your new password is: ${newPassword}`);

    return true;
  }

  logger.error(`No user was found with email: ${email}`);

  throw new Error('Could not reset password. Try again later.');
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
  const user = await UserRepo.findByEmail(email);

  if (user) {
    logger.info(`Changing password for user: ${email}`);

    const isMatch = bcrypt.compareSync(oldPassword, user.password);

    if (isMatch) {
      user.password = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(WORK_FACTOR));
      await UserRepo.update(user.id!, user);

      return true;
    }

    throw new Error('Invalid Password');
  }

  throw new Error(`No user was found with email: ${email}`);
}
