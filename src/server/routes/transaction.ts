import contentRouteFactory from './contentRouteFactory';
import createAccessTokenValidation from '../utils/authorization';
import TransactionController from '../controllers/transactionController';

const router = contentRouteFactory(TransactionController);

router.get('/types', createAccessTokenValidation(), TransactionController.getTransactionTypes.bind(TransactionController));

export default router;
