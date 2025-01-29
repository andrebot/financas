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
  token: string;
}
