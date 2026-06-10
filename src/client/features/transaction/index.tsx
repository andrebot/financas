import baseApi from '../apiSlice';
import type { ApiBuilder, Transaction } from '../../types';

export const listTransactionQuery = () => ({
  url: '/accountant',
  method: 'GET',
});

export const createTransactionMutation = (body: Transaction) => ({
  url: '/accountant',
  method: 'POST',
  body,
});

export const updateTransactionMutation = (body: Transaction) => ({
  url: `/accountant/${body.id}`,
  method: 'PUT',
  body,
});

export const deleteTransactionMutation = (id: string) => ({
  url: `/accountant/${id}`,
  method: 'DELETE',
});

export const getTransactionQuery = (id: string) => ({
  url: `/accountant/${id}`,
  method: 'GET',
});

// This was done so testing would be easier.
export const endpoints = (builder: ApiBuilder) => ({
  listTransactions: builder.query<Transaction[], void>({
    query: listTransactionQuery,
    providesTags: [{ type: 'Transaction', id: 'LIST' }],
  }),
  createTransaction: builder.mutation<Transaction, Transaction>({
    query: createTransactionMutation,
    invalidatesTags: [{ type: 'Transaction', id: 'LIST' }],
  }),
  updateTransaction: builder.mutation<Transaction, Transaction>({
    query: updateTransactionMutation,
    invalidatesTags: [{ type: 'Transaction', id: 'LIST' }],
  }),
  deleteTransaction: builder.mutation<Transaction, string>({
    query: deleteTransactionMutation ,
    invalidatesTags: [{ type: 'Transaction', id: 'LIST' }],
  }),
  getTransaction: builder.query<Transaction, string>({
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
