import jwt from 'jsonwebtoken';
import { NextFunction, Response } from 'express';
import { ACCESS_TOKEN_SECRET } from '../config/auth';
import { UserPayload, RequestWithUser } from '../types';

const regExpBearer = /^[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+$/;

export function createTokenValidation(isAdmin: boolean = false): 
(req: RequestWithUser, res: Response, next: NextFunction) => void {
  return function (req: RequestWithUser, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token || !regExpBearer.test(token)) {
      return res.sendStatus(401);
    }

    try {
      const payload = jwt.verify(token, ACCESS_TOKEN_SECRET);

      if (typeof payload !== 'object' || payload === null) {
        return res.sendStatus(403);
      }

      const user = payload as UserPayload;

      if (isAdmin && user.role !== 'admin') {
        return res.sendStatus(403);
      }

      req.user = user;
      next();
    } catch (err) {
      return res.sendStatus(403);
    }
  }
}
