import React from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import App from '../../src/client/app';
import { store } from '../../src/client/features/store';

// Mocking the useAppSelector hook
jest.mock('../../src/client/hooks/index', () => ({
  useAppSelector: jest.fn().mockImplementation((selector) => selector({ theme: 'light' })),
}));

describe('App', () => {
  it('renders without crashing', () => {
    expect(() => render(
      <Provider store={store}>
        <App />
      </Provider>
    )).not.toThrow();
  });
});
