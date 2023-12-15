import React from 'react';
import { UserType } from './user';

export type AuthContextType = {
  user: UserType;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
}
