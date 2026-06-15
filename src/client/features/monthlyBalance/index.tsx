import baseApi from '../apiSlice';
import type { ApiBuilder, MonthlyBalance, MonthlyBalanceParams } from '../../types';

export const listMonthlyBalancesQuery = ({ year, month }: MonthlyBalanceParams) => ({
  url: `/accountant/monthly-balance?year=${year}&month=${month}`,
  method: 'GET',
});

export const endpoints = (builder: ApiBuilder) => ({
  listMonthlyBalances: builder.query<MonthlyBalance[], MonthlyBalanceParams>({
    query: listMonthlyBalancesQuery,
    providesTags: [{ type: 'MonthlyBalance', id: 'LIST' }],
  }),
});

export const monthlyBalanceAPI = baseApi.injectEndpoints({ endpoints });

export const { useListMonthlyBalancesQuery } = monthlyBalanceAPI;
