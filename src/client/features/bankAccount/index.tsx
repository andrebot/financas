// eslint-disable-next-line import/no-unresolved
import baseApi from '../apiSlice';
import type { ApiBuilder } from '../../types/requests';
import type { BankAccount } from '../../types/bankAccounts';

export const listBankAccountQuery = () => ({
  url: '/account',
  method: 'GET',
});

export const createBankAccountMutation = (bankAccount: BankAccount) => ({
  url: '/account',
  method: 'POST',
  body: bankAccount,
});

export const updateBankAccountMutation = (bankAccount: BankAccount) => ({
  url: `/account/${bankAccount.id}`,
  method: 'PUT',
  body: bankAccount,
});

export const deleteBankAccountMutation = (id: string) => ({
  url: `/account/${id}`,
  method: 'DELETE',
});

export const getBankAccountQuery = (id: string) => ({
  url: `/account/${id}`,
  method: 'GET',
});

// This was done so testing would be easier.
export const endpoints = (builder: ApiBuilder) => ({
  listBankAccounts: builder.query<BankAccount[], void>({
    query: listBankAccountQuery,
    providesTags: [{ type: 'BankAccount', id: 'LIST' }],
  }),
  createBankAccount: builder.mutation<BankAccount, BankAccount>({
    query: createBankAccountMutation,
    invalidatesTags: [{ type: 'BankAccount', id: 'LIST' }],
  }),
  updateBankAccount: builder.mutation<BankAccount, BankAccount>({
    query: updateBankAccountMutation,
    invalidatesTags: [{ type: 'BankAccount', id: 'LIST' }],
  }),
  deleteBankAccount: builder.mutation<BankAccount, string>({
    query: deleteBankAccountMutation,
    invalidatesTags: [{ type: 'BankAccount', id: 'LIST' }],
  }),
  getBankAccount: builder.query<BankAccount, string>({
    query: getBankAccountQuery,
  }),
});

export const bankAccountAPI = baseApi.injectEndpoints({
  endpoints,
});

export const {
  useListBankAccountsQuery,
  useCreateBankAccountMutation,
  useUpdateBankAccountMutation,
  useDeleteBankAccountMutation,
  useGetBankAccountQuery,
} = bankAccountAPI;
