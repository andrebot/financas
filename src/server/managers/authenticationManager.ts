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

export function createToken(payload: UserPayload, expiresIn: string, secret: string): string {
  return jwt.sign(payload, secret, { issuer: ISSUER, expiresIn });
}

export function createAccessToken(
  email: string,
  role: string,
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

export function createRefreshToken(email: string): string {
  return createToken({ email }, REFRESH_TOKEN_EXPIRATION, REFRESH_TOKEN_SECRET);
}

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

export async function updateUser(id: string, payload: UserPayload): Promise<IUser> {
  const user = await UserModel.findById(id);

  if (!payload || (!payload.email && !payload.firstName && !payload.lastName)) {
    throw new Error('No information provided to be updated');
  }

  const {
    email,
    firstName,
    lastName,
  } = payload;

  if (user) {
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
  throw new Error('User not found');
}

export function listUsers(query: FilterQuery<IUser> = {}): Promise<IUser[]> {
  return UserModel.find(query);
}

export async function deleteUser(id: string): Promise<IUser> {
  return UserModel.findByIdAndDelete(id).then((deletedUser) => {
    if (!deletedUser) {
      throw new Error(`User not found ${id}`);
    }

    return deletedUser.value as IUser;
  });
}

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

export async function logout(refreshToken: string): Promise<boolean> {
  try {
    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, { complete: true }) as Token;

    deleteToken(refreshToken);

    return true;
  } catch (error) {
    Logger.error('Failed to verify token');
    Logger.error(error);

    return false;
  }
}

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
