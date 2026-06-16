import baseApi from '../apiSlice';
import type { ApiBuilder, Transaction } from '../../types';

/** Returns the RTK Query config for listing all transactions. */
export const listTransactionQuery = () => ({
  url: '/accountant',
  method: 'GET',
});

/**
 * Returns the RTK Query config for creating a transaction.
 *
 * @param body - The transaction payload to POST.
 */
export const createTransactionMutation = (body: Transaction) => ({
  url: '/accountant',
  method: 'POST',
  body,
});

/**
 * Returns the RTK Query config for updating an existing transaction.
 *
 * @param body - The transaction payload including its id.
 */
export const updateTransactionMutation = (body: Transaction) => ({
  url: `/accountant/${body.id}`,
  method: 'PUT',
  body,
});

/**
 * Returns the RTK Query config for deleting a transaction by id.
 *
 * @param id - The transaction id to delete.
 */
export const deleteTransactionMutation = (id: number) => ({
  url: `/accountant/${id}`,
  method: 'DELETE',
});

/**
 * Returns the RTK Query config for fetching a single transaction by id.
 *
 * @param id - The transaction id to fetch.
 */
export const getTransactionQuery = (id: number) => ({
  url: `/accountant/${id}`,
  method: 'GET',
});

/**
 * Registers all transaction endpoints on the base API slice.
 * Exported separately so each endpoint can be unit-tested without
 * depending on the full RTK Query store setup.
 *
 * @param builder - The RTK Query endpoint builder.
 */
export const endpoints = (builder: ApiBuilder) => ({
  listTransactions: builder.query<Transaction[], void>({
    query: listTransactionQuery,
    providesTags: [{ type: 'Transaction', id: 'LIST' }],
  }),
  createTransaction: builder.mutation<Transaction, Transaction>({
    query: createTransactionMutation,
    invalidatesTags: [{ type: 'Transaction', id: 'LIST' }, { type: 'MonthlyBalance', id: 'LIST' }, { type: 'Budget', id: 'LIST' }, { type: 'Goal', id: 'LIST' }],
  }),
  updateTransaction: builder.mutation<Transaction, Transaction>({
    query: updateTransactionMutation,
    invalidatesTags: [{ type: 'Transaction', id: 'LIST' }, { type: 'MonthlyBalance', id: 'LIST' }, { type: 'Budget', id: 'LIST' }, { type: 'Goal', id: 'LIST' }],
  }),
  deleteTransaction: builder.mutation<Transaction, number>({
    query: deleteTransactionMutation ,
    invalidatesTags: [{ type: 'Transaction', id: 'LIST' }, { type: 'MonthlyBalance', id: 'LIST' }, { type: 'Budget', id: 'LIST' }, { type: 'Goal', id: 'LIST' }],
  }),
  getTransaction: builder.query<Transaction, number>({
    query: getTransactionQuery ,
  }),
});

export const transactionAPI = baseApi.injectEndpoints({
  endpoints,
});

export const {
  useListTransactionsQuery,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
  useGetTransactionQuery,
} = transactionAPI;
