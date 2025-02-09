import contentRouteFactory from './contentRouteFactory';
import createTokenValidation from '../utils/authorization';
import TransactionController from '../controllers/transactionController';

const {
  urlPrefix,
  router,
} = contentRouteFactory(TransactionController, 'transaction');

router.get('/types', createTokenValidation(), TransactionController.getTransactionTypes.bind(TransactionController));

export default { urlPrefix, router };
