import ContentController from './contentController';
import AccountManager from '../managers/accountManager';

import type { IAccount } from '../types';

export default new ContentController<IAccount>(AccountManager, 'AccountController');
