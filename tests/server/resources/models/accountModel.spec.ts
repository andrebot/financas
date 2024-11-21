import { should } from 'chai';
import mongoose from 'mongoose';
import AccountModel, { IAccountDocument } from '../../../../src/server/resources/models/accountModel';
import checkRequiredField from '../../checkRequiredField';

describe('AccountModel', () => {
  let account: IAccountDocument;

  beforeEach(() => {
    account = new AccountModel({
      name: 'Test Account',
      agency: '1234',
      accountNumber: '123456',
      currency: 'BRL',
      user: new mongoose.Types.ObjectId().toString(),
      cards: [
        {
          number: '1234567890123456',
          expirationDate: '12/2020',
        },
      ],
    });
  });

  it('should be invalid if name is empty', () => {
    checkRequiredField(account, 'name');
  });

  it('should be invalid if agency is empty', () => {
    checkRequiredField(account, 'agency');
  });

  it('should be invalid if accountNumber is empty', () => {
    checkRequiredField(account, 'accountNumber');
  });

  it('should be invalid if currency is empty', () => {
    checkRequiredField(account, 'currency');
  });

  it('should be invalid if user is empty', () => {
    checkRequiredField(account, 'user', 'ObjectId');
  });

  it('should be able to save', () => {
    const error = account.validateSync();

    should().not.exist(error);
  });
});
