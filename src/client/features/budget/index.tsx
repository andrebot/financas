import baseApi from '../apiSlice';
import type { ApiBuilder, Budget } from '../../types';

export const listBudgetQuery = () => ({
  url: '/budget',
  method: 'GET',
});

export const createBudgetMutation = (body: Budget) => ({
  url: '/budget',
  method: 'POST',
  body,
});

export const updateBudgetMutation = (body: Budget) => ({
  url: `/budget/${body.id}`,
  method: 'PUT',
  body,
});

export const deleteBudgetMutation = (id: string) => ({
  url: `/budget/${id}`,
  method: 'DELETE',
});

export const getBudgetQuery = (id: string) => ({
  url: `/budget/${id}`,
  method: 'GET',
});

// This was done so testing would be easier.
export const endpoints = (builder: ApiBuilder) => ({
  listBudgets: builder.query<Budget[], void>({
    query: listBudgetQuery,
    providesTags: [{ type: 'Budget', id: 'LIST' }],
  }),
  createBudget: builder.mutation<Budget, Budget>({
    query: createBudgetMutation,
    invalidatesTags: [{ type: 'Budget', id: 'LIST' }],
  }),
  updateBudget: builder.mutation<Budget, Budget>({
    query: updateBudgetMutation,
    invalidatesTags: [{ type: 'Budget', id: 'LIST' }],
  }),
  deleteBudget: builder.mutation<Budget, string>({
    query: deleteBudgetMutation,
    invalidatesTags: [{ type: 'Budget', id: 'LIST' }],
  }),
  getBudget: builder.query<Budget, string>({
    query: getBudgetQuery,
  }),
});

export const budgetAPI = baseApi.injectEndpoints({
  endpoints,
});

export const {
  useListBudgetsQuery,
  useCreateBudgetMutation,
  useUpdateBudgetMutation,
  useDeleteBudgetMutation,
  useGetBudgetQuery,
} = budgetAPI;
