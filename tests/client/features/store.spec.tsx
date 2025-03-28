import { store } from '../../../src/client/features/store';
import themeReducer, { toggleTheme } from '../../../src/client/features/themeSlice';
import { loginApi } from '../../../src/client/features/login';

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

    expect(state.theme).toEqual(themeReducer(undefined, { type: '@@INIT' }));
    expect(state[loginApi.reducerPath]).toEqual(loginApi.reducer(undefined, { type: '@@INIT' }));
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
