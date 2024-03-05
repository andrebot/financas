import contentRouteFactory from './contentRouteFactory';
import createTokenValidation from '../utils/authorization';
import TransactionModel, { ITransaction } from '../resources/transactionModel';
import { getTransactionTypes } from '../controllers/transaction';

const {
  urlPrefix,
  router,
} = contentRouteFactory<ITransaction>(TransactionModel, 'transaction');

router.get('/types', createTokenValidation(), getTransactionTypes);

export default { urlPrefix, router };
