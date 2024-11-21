import contentRouteFactory from './contentRouteFactory';
import accountController from '../controllers/accountController';

export default contentRouteFactory(accountController, 'account');
