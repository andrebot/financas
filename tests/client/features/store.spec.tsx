import { store } from '../../../src/client/features/store';
import themeReducer, { toggleTheme } from '../../../src/client/features/themeSlice';
import { apiSlice } from '../../../src/client/features/testAPI';

jest.mock('@reduxjs/toolkit/query/react', () => {
  const originalModule = jest.requireActual('@reduxjs/toolkit/query/react');
  return {
    ...originalModule,
    fetchBaseQuery: () => jest.fn(() => Promise.resolve({ data: [] })),
  };
});

describe('Redux Store', () => {
  it('should correctly configure the store with reducers', () => {
    const state = store.getState();

    expect(state.theme).toEqual(themeReducer(undefined, { type: undefined }));
    expect(state[apiSlice.reducerPath]).toEqual(apiSlice.reducer(undefined, { type: undefined }));
  });

  it('should handle actions from theme reducer', () => {
    let state = store.getState();

    // Initial state check for theme reducer
    expect(state.theme).toBe('dark');

    // Dispatch an action and check if the state updates correctly
    store.dispatch(toggleTheme());
    state = store.getState();
    expect(state.theme).toBe('light');
  });
});
