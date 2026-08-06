import { Response } from 'express';
import CommonController from './commonController';
import { createLogger } from '../utils/logger';
import { checkVoidUser } from '../utils/misc';
import { handleError } from '../utils/responseHandlers';
import type {
  ICommonController,
  IInvestment,
  IInvestmentListFilters,
  IAccountantManager,
  RequestWithUser,
} from '../types';

const logger = createLogger('InvestmentController');

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 20;

/**
 * Parses a comma-separated investment type list from a query param.
 *
 * @param value - The raw query param value.
 * @returns The parsed types, or undefined when not provided.
 */
function parseTypes(value: unknown): string[] | undefined {
  if (typeof value !== 'string' || value.length === 0) return undefined;

  return value.split(',').map((type) => type.trim()).filter(Boolean);
}

/**
 * Parses an optional ISO date query param into a Date.
 * Invalid or missing values are treated as not provided rather than erroring,
 * so a malformed date silently falls back to "no filter" instead of a 500.
 *
 * @param value - The raw query param value.
 * @returns The parsed date, or undefined when not provided or invalid.
 */
function parseDate(value: unknown): Date | undefined {
  if (typeof value !== 'string' || value.length === 0) return undefined;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? undefined : date;
}

/**
 * Parses an optional boolean query param ("true"/"false").
 * Any value other than the literal string "true" or "false" is treated as
 * not provided, so both archived and active investments are returned.
 *
 * @param value - The raw query param value.
 * @returns The parsed boolean, or undefined when not provided.
 */
function parseBoolean(value: unknown): boolean | undefined {
  if (value === 'true') return true;
  if (value === 'false') return false;

  return undefined;
}

/**
 * Builds investment list filters from request query params.
 *
 * @param query - The request query object.
 * @returns The parsed filters, with page/pageSize defaulted and capped.
 */
export function buildInvestmentFilters(query: RequestWithUser['query']): IInvestmentListFilters {
  const page = Number(query.page);
  const pageSize = Number(query.pageSize);

  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: Number.isFinite(pageSize) && pageSize > 0
      ? Math.min(pageSize, MAX_PAGE_SIZE)
      : DEFAULT_PAGE_SIZE,
    investmentTypes: parseTypes(query.investmentType),
    archived: parseBoolean(query.archived),
    createdAtStart: parseDate(query.createdAtStart),
    createdAtEnd: parseDate(query.createdAtEnd),
    dueDateStart: parseDate(query.dueDateStart),
    dueDateEnd: parseDate(query.dueDateEnd),
  };
}

/**
 * Handles GET requests to list investments, filtered and paginated by query params.
 *
 * @throws {Error} - If no user is parsed in the request.
 *
 * @param req - The request object with page/pageSize/investmentType/archived/date query params.
 * @param res - The response object.
 * @param manager - The accountant manager to use.
 * @returns A page of investments plus pagination metadata.
 */
export async function listInvestments(
  req: RequestWithUser,
  res: Response,
  manager: IAccountantManager,
): Promise<Response> {
  try {
    checkVoidUser(req.user, 'Investment', 'list');

    const filters = buildInvestmentFilters(req.query);
    const result = await manager.listInvestments(filters);

    logger.info(`Listed ${result.data.length}/${result.total} investments for user: ${req.user?.id}`);

    return res.send(result);
  } catch (error) {
    logger.error(error);

    return handleError(error as Error, res);
  }
}

/**
 * Creates a new investment controller for managing investments directly
 * (outside of the transaction-embedded investmentEntry flow).
 *
 * @param manager - The accountant manager to use.
 * @returns The investment controller.
 */
export default function InvestmentController(
  manager: IAccountantManager,
): ICommonController<IInvestment> {
  const commonController = CommonController<IInvestment>({
    createContent: manager.createInvestment,
    updateContent: manager.updateInvestment,
    deleteContent: manager.deleteInvestment,
    getContent: manager.getInvestment,
  }, 'Investment');

  return {
    ...commonController,
    listContent: (req: RequestWithUser, res: Response) => listInvestments(req, res, manager),
  };
}
