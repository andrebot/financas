// eslint-disable-next-line import/no-unresolved
import baseApi from '../apiSlice';
import type { ApiBuilder } from '../../types/requests';
import type { BankAccount } from '../../types/bankAccounts';

/**
 * This query is used to list all bank accounts.
 *
 * @returns The list bank account query
 */
export const listBankAccountQuery = () => ({
  url: '/account',
  method: 'GET',
});

/**
 * This mutation is used to create a bank account.
 *
 * @param bankAccount - The bank account to create
 * @returns The create bank account mutation
 */
export const createBankAccountMutation = (bankAccount: BankAccount) => ({
  url: '/account',
  method: 'POST',
  body: bankAccount,
});

/**
 * This mutation is used to update a bank account.
 *
 * @param bankAccount - The bank account to update
 * @returns The update bank account mutation
 */
export const updateBankAccountMutation = (bankAccount: BankAccount) => ({
  url: `/account/${bankAccount.id}`,
  method: 'PUT',
  body: bankAccount,
});

/**
 * This mutation is used to delete a bank account.
 *
 * @param id - The id of the bank account to delete
 * @returns The delete bank account mutation
 */
export const deleteBankAccountMutation = (id: string) => ({
  url: `/account/${id}`,
  method: 'DELETE',
});

/**
 * This query is used to get a bank account by id.
 *
 * @param id - The id of the bank account to get
 * @returns The get bank account query
 */
export const getBankAccountQuery = (id: string) => ({
  url: `/account/${id}`,
  method: 'GET',
});

/**
 * This is the endpoints for the bank account feature.
 * 
 * @remarks
 * This is the endpoints for the bank account feature.
 *
 * @param builder - The builder to use
 * @returns The endpoints
 */
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
