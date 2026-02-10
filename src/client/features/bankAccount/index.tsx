// eslint-disable-next-line import/no-unresolved
import { BankAccount } from '../../types/bankAccounts';
import baseApi from '../apiSlice';

export const listBankAccountQuery = () => ({
  url: '/account',
  method: 'POST',
});

export const bankAccountApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listBankAccount: builder.query<BankAccount[], void>({
      query: listBankAccountQuery,
    }),
  }),
});

export const {
  useListBankAccountQuery,
} = bankAccountApi;
