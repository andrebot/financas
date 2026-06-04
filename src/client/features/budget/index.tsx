import baseApi from '../apiSlice';
import type { ApiBuilder, Budget } from '../../types';

/**
 * Builds the request used to list budgets.
 *
 * @returns The RTK Query request configuration.
 */
export const listBudgetQuery = () => ({
  url: '/budget',
  method: 'GET',
});

/**
 * Builds the request used to create a budget.
 *
 * @param body - The budget payload to create.
 * @returns The RTK Query request configuration.
 */
export const createBudgetMutation = (body: Budget) => ({
  url: '/budget',
  method: 'POST',
  body,
});

/**
 * Builds the request used to update a budget.
 *
 * @param body - The budget payload to update.
 * @returns The RTK Query request configuration.
 */
export const updateBudgetMutation = (body: Budget) => ({
  url: `/budget/${body.id}`,
  method: 'PUT',
  body,
});

/**
 * Builds the request used to delete a budget.
 *
 * @param id - The id of the budget to delete.
 * @returns The RTK Query request configuration.
 */
export const deleteBudgetMutation = (id: number) => ({
  url: `/budget/${id}`,
  method: 'DELETE',
});

/**
 * Builds the request used to load a single budget.
 *
 * @param id - The id of the budget to load.
 * @returns The RTK Query request configuration.
 */
export const getBudgetQuery = (id: number) => ({
  url: `/budget/${id}`,
  method: 'GET',
});

/**
 * Registers the budget endpoints with the shared RTK Query API builder.
 * This is exported separately so endpoint wiring can be unit tested.
 *
 * @param builder - The RTK Query endpoint builder.
 * @returns The budget endpoint definitions.
 */
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
