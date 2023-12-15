import React from 'react';
import { render } from '@testing-library/react';
import App from '../../src/client/app';

// Mocking the useAppSelector hook
jest.mock('../../src/client/hooks/index', () => ({
  useAppSelector: jest.fn().mockImplementation((selector) => selector({ theme: 'light' })),
}));

describe('App', () => {
  it('renders without crashing', () => {
    expect(() => render(
      <App />
    )).not.toThrow();
  });
});
