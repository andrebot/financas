import React from 'react';
import { Provider } from 'react-redux';
import { useAppDispatch, useAppSelector } from '../../../src/client/hooks/index';
import { store } from '../../../src/client/app/store';
import { renderHook } from '@testing-library/react';

jest.mock('@reduxjs/toolkit/query/react', () => {
  const originalModule = jest.requireActual('@reduxjs/toolkit/query/react');
  return {
    ...originalModule,
    fetchBaseQuery: () => jest.fn(() => Promise.resolve({ data: [] })),
  };
});

describe('Redux Custom Hooks', () => {
  it('useAppDispatch should return the dispatch function from the store', () => {
    const { result } = renderHook(() => useAppDispatch(), {
      wrapper: ({ children }: any) => <Provider store={store}>{children}</Provider>,
    });

    expect(typeof result.current).toBe('function');
  });

  it('useAppSelector should return the correct state slice', () => {
    const { result } = renderHook(() => useAppSelector(state => state.theme), {
      wrapper: ({ children }: any) => <Provider store={store}>{children}</Provider>,
    });

    expect(result.current).toEqual('dark');
  });
});
