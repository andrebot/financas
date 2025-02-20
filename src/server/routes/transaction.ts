import contentRouteFactory from './contentRouteFactory';
import { createAccessTokenValidation } from '../utils/authorization';
import TransactionController from '../controllers/transactionController';

const {
  urlPrefix,
  router,
} = contentRouteFactory(TransactionController, 'transaction');

router.get('/types', createAccessTokenValidation(), TransactionController.getTransactionTypes.bind(TransactionController));

export default { urlPrefix, router };
