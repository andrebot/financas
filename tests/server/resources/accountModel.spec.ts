import { should } from 'chai';
import AccountModel, { IAccount } from '../../../src/server/resources/accountModel';

interface IAccountTest extends IAccount{
  [key: string]: any;
}

function checkRequiredField(account: IAccountTest, field: string) {
  account[field] = '';

  const error = account.validateSync();

  should().exist(error);
  error?.should.have.property('errors');
  error?.errors.should.have.property(field);
  error?.errors[field].should.have.property('kind').eql('required');
}

describe('AccountModel', () => {
  let account: IAccount;

  beforeEach(() => {
    account = new AccountModel({
      name: 'Test Account',
      agency: '1234',
      accountNumber: '123456',
      currency: 'BRL',
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

  it('should be able to save', () => {
    const error = account.validateSync();

    should().not.exist(error);
  });
});
