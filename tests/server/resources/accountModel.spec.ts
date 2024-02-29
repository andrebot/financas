import { should } from 'chai';
import AccountModel, { IAccount } from '../../../src/server/resources/accountModel';
import mongoose from 'mongoose';

interface IAccountTest extends IAccount{
  [key: string]: any;
}

function checkRequiredField(account: IAccountTest, field: string, eql: string = 'required') {
  account[field] = '';

  const error = account.validateSync();

  should().exist(error);
  error?.should.have.property('errors');
  error?.errors.should.have.property(field);
  error?.errors[field].should.have.property('kind').eql(eql);
}

describe('AccountModel', () => {
  let account: IAccount;

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
