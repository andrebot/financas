import contentRouteFactory from './contentRouteFactory';
import accountModel, { IAccount } from '../resources/accountModel';

export default contentRouteFactory<IAccount>(accountModel, 'account');
