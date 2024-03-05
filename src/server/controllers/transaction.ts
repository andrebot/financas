import { Request, Response } from 'express';
import { TRANSACTION_TYPES, INVESTMENT_TYPES } from '../resources/transactionModel';

// eslint-disable-next-line import/prefer-default-export
export function getTransactionTypes(req: Request, res: Response) {
  res.send({
    transactionTypes: Object.values(TRANSACTION_TYPES),
    investmentTypes: Object.values(INVESTMENT_TYPES),
  });
}
