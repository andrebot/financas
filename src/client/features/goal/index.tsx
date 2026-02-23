import baseApi from '../apiSlice';
import type { ApiBuilder, Goal } from '../../types';

export const listGoalQuery = () => ({
  url: '/goal',
  method: 'GET',
});

export const createGoalMutation = (body: Goal) => ({
  url: '/goal',
  method: 'POST',
  body,
});

export const updateGoalMutation = (body: Goal) => ({
  url: `/goal/${body.id}`,
  method: 'PUT',
  body,
});

export const deleteGoalMutation = (id: string) => ({
  url: `/goal/${id}`,
  method: 'DELETE',
});

export const getGoalQuery = (id: string) => ({
  url: `/goal/${id}`,
  method: 'GET',
});

// This was done so testing would be easier.
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
  deleteGoal: builder.mutation<Goal, string>({
    query: deleteGoalMutation,
    invalidatesTags: [{ type: 'Goal', id: 'LIST' }],
  }),
  getGoal: builder.query<Goal, string>({
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
