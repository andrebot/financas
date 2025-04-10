import React from 'react';
import { UserType } from './user';

export type AuthContextType = {
  user: UserType | undefined;
  setUser: React.Dispatch<React.SetStateAction<UserType | undefined>>;
}

export type LoginBody = {
  email: string;
  password: string;
}

export type LoginResponse = {
  user: {
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
    id: string;
  };
  accessToken: string;
}

export type RefreshTokenResponse = {
  accessToken: string;
}

export type RegisterBody = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export type ResetPasswordBody = {
  email: string;
}

export type DefaultServerResponse = {
  message: string;
}

export type UpdateUserBody = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export type UpdateUserResponse = {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export type ChangePasswordBody = {
  oldPassword: string;
  newPassword: string;
}
