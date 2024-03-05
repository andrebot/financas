import contentRouteFactory from './contentRouteFactory';
import createTokenValidation from '../utils/authorization';
import TransactionModel, {
  ITransaction,
  TRANSACTION_TYPES,
  INVESTMENT_TYPES,
} from '../resources/transactionModel';

const {
  urlPrefix,
  router,
} = contentRouteFactory<ITransaction>(TransactionModel, 'transaction');

router.get('/types', createTokenValidation(), (req, res) => {
  res.send({
    transactionTypes: Object.values(TRANSACTION_TYPES),
    investmentTypes: Object.values(INVESTMENT_TYPES),
  });
});

export { urlPrefix, router };
