import baseApi from '../apiSlice';
import type { ApiBuilder, Goal } from '../../types';

/**
 * Builds the request used to list goals.
 *
 * @returns The RTK Query request configuration.
 */
export const listGoalQuery = () => ({
  url: '/goal',
  method: 'GET',
});

/**
 * Builds the request used to create a goal.
 *
 * @param body - The goal payload to create.
 * @returns The RTK Query request configuration.
 */
export const createGoalMutation = (body: Goal) => ({
  url: '/goal',
  method: 'POST',
  body,
});

/**
 * Builds the request used to update a goal.
 *
 * @param body - The goal payload to update.
 * @returns The RTK Query request configuration.
 */
export const updateGoalMutation = (body: Goal) => ({
  url: `/goal/${body.id}`,
  method: 'PUT',
  body,
});

/**
 * Builds the request used to delete a goal.
 *
 * @param id - The id of the goal to delete.
 * @returns The RTK Query request configuration.
 */
export const deleteGoalMutation = (id: number) => ({
  url: `/goal/${id}`,
  method: 'DELETE',
});

/**
 * Builds the request used to load a single goal.
 *
 * @param id - The id of the goal to load.
 * @returns The RTK Query request configuration.
 */
export const getGoalQuery = (id: number) => ({
  url: `/goal/${id}`,
  method: 'GET',
});

/**
 * Registers the goal endpoints with the shared RTK Query API builder.
 * This is exported separately so endpoint wiring can be unit tested.
 *
 * @param builder - The RTK Query endpoint builder.
 * @returns The goal endpoint definitions.
 */
export const endpoints = (builder: ApiBuilder) => ({
  listGoals: builder.query<Goal[], void>({
    query: listGoalQuery,
    providesTags: [{ type: 'Goal', id: 'LIST' }],
  }),
  createGoal: builder.mutation<Goal, Goal>({
    query: createGoalMutation,
    invalidatesTags: [{ type: 'Goal', id: 'LIST' }],
  }),
  updateGoal: builder.mutation<Goal, Goal>({
    query: updateGoalMutation,
    invalidatesTags: [{ type: 'Goal', id: 'LIST' }],
  }),
  deleteGoal: builder.mutation<Goal, number>({
    query: deleteGoalMutation,
    invalidatesTags: [{ type: 'Goal', id: 'LIST' }],
  }),
  getGoal: builder.query<Goal, number>({
    query: getGoalQuery,
  }),
});

export const goalAPI = baseApi.injectEndpoints({
  endpoints,
});

export const {
  useListGoalsQuery,
  useCreateGoalMutation,
  useUpdateGoalMutation,
  useDeleteGoalMutation,
  useGetGoalQuery,
} = goalAPI;
