import baseApi from '../apiSlice';
import type { ApiBuilder, Budget, Category } from '../../types';

export const listBudgetQuery = () => ({
  url: '/budget',
  method: 'GET',
});

export const listBudgetCategoriesQuery = (budgetId: number) => ({
  url: `/budget/${budgetId}/categories`,
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

export const deleteBudgetMutation = (id: number) => ({
  url: `/budget/${id}`,
  method: 'DELETE',
});

export const getBudgetQuery = (id: number) => ({
  url: `/budget/${id}`,
  method: 'GET',
});

// This was done so testing would be easier.
export const endpoints = (builder: ApiBuilder) => ({
  listBudgets: builder.query<Budget[], void>({
    query: listBudgetQuery,
    providesTags: [{ type: 'Budget', id: 'LIST' }],
  }),
  listBudgetCategories: builder.query<Category[], number>({
    query: listBudgetCategoriesQuery,
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
  deleteBudget: builder.mutation<Budget, number>({
    query: deleteBudgetMutation,
    invalidatesTags: [{ type: 'Budget', id: 'LIST' }],
  }),
  getBudget: builder.query<Budget, number>({
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
