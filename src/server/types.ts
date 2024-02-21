import jwt from 'jsonwebtoken';

export type Tokens = {
  accessToken: string;
  refreshToken: string;
};

export interface Token extends jwt.Jwt {
  payload: {
    email: string;
    role: 'admin' | 'user';
    firstName: string;
    lastName: string;
  }
}

export type UserPayload = {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
};
