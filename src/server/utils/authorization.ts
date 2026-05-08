import jwt from 'jsonwebtoken';
import { NextFunction, Response } from 'express';
import { AsyncLocalStorage } from 'async_hooks';
import { eq, SQL } from 'drizzle-orm';
import { ACCESS_TOKEN_SECRET } from '../config/auth';
import {
  UserPayload,
  RequestWithUser,
  TokenValidationMiddleware,
  RequestContext,
  TableWithUserId,
  Table,
} from '../types';
import { regExpBearer } from './validators';
import { createLogger } from './logger';

const logger = createLogger('AuthorizationUtils');
export const requestContext = new AsyncLocalStorage<RequestContext>();

function tableHasTenantUserId(table: Table): table is TableWithUserId {
  return table.userId !== undefined;
}

export function getAutorizationDatabaseContext(table: Table): SQL | undefined {
  const context = requestContext.getStore();

  if (!context) {
    throw new Error('No authorization context found');
  }

  if (context.isAdmin || !tableHasTenantUserId(table)) {
    return undefined;
  }

  return eq(table.userId, context.userId);
}

/**
 * Check if the payload is valid
 *
 * @param payload - The payload
 * @throws 403 - If the payload is not an object or null
 */
function checkValidPayload(payload: string | jwt.JwtPayload): void {
  if (typeof payload !== 'object' || payload === null) {
    throw new Error('Invalid payload');
  }
}

/**
 * Check if the user has admin access
 *
 * @param user - The user
 * @param isAdmin - Whether the user must be an admin
 * @throws 403 - If the user is not an admin
 */
function checkAdminAccess(user: UserPayload, isAdmin: boolean): void {
  if (user.role !== 'admin' && isAdmin) {
    throw new Error('User is not an admin');
  }
}

/**
 * Create a token validation middleware
 *
 * @param isAdmin - Whether the user must be an admin
 * @returns The token validation middleware
 */
export default function createAccessTokenValidation(isAdmin: boolean = false):
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
  return function accessTokenValidator(
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
  ): void {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token || !regExpBearer.test(token)) {
      logger.info('Token is missing or invalid');

      res.sendStatus(401);
      return;
    }

    try {
      const payload = jwt.verify(token, ACCESS_TOKEN_SECRET) as UserPayload;

      checkValidPayload(payload);
      checkAdminAccess(payload, isAdmin);

      logger.info('Token is valid');

      req.user = payload;

      logger.info('User payload added to request object');

      requestContext.run({ userId: payload.id!, isAdmin: payload.role === 'admin' }, () => {
        next();
      });
    } catch (err) {
      logger.error(err);
      res.sendStatus(403);
    }
  };
}
