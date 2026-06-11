import baseApi from '../apiSlice';
import type { ApiBuilder, MonthlyBalance } from '../../types';

type MonthlyBalanceParams = {
  year: number;
  /** 1-indexed month (1 = January … 12 = December). */
  month: number;
};

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
