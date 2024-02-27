import jwt from 'jsonwebtoken';
import { NextFunction, Response } from 'express';
import { ACCESS_TOKEN_SECRET } from '../config/auth';
import {
  UserPayload,
  RequestWithUser,
  TokenValidationMiddleware,
} from '../types';
import { regExpBearer } from './validators';

/**
 * Create a token validation middleware
 *
 * @param isAdmin - Whether the user must be an admin
 * @returns The token validation middleware
 */
export default function createTokenValidation(isAdmin: boolean = false):
TokenValidationMiddleware {
  /**
   * Token validation middleware function. It checks if the token is valid and if
   * the user is an admin or not, depending on the isAdmin parameter.
   *
   * @throws 401 - If the token is missing
   * @throws 403 - If the token is invalid
   * @throws 403 - If the user is not an admin
   * @throws 403 - If the payload is not an object
   * @throws 403 - If the payload is null
   * @throws 403 - If the token is expired
   * @throws 403 - If the token is invalid
   *
   * @param req - The request object
   * @param res - The response object
   * @param next - The next function
   * @returns void
   */
  return function tokenValidator(req: RequestWithUser, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token || !regExpBearer.test(token)) {
      res.sendStatus(401);
      return;
    }

    try {
      const payload = jwt.verify(token, ACCESS_TOKEN_SECRET);

      if (typeof payload !== 'object' || payload === null) {
        res.sendStatus(403);
        return;
      }

      const user = payload as UserPayload;

      if (isAdmin && user.role !== 'admin') {
        res.sendStatus(403);
        return;
      }

      req.user = user;
      next();
    } catch (err) {
      res.sendStatus(403);
    }
  };
}
