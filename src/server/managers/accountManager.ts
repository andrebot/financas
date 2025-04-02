import ContentManager from './contentManager';
import accountRepo from '../resources/repositories/accountRepo';
import type { IAccount } from '../types';

export default new ContentManager<IAccount>(accountRepo, 'AccountManager');
