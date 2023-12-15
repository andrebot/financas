import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import MainPage from '../../../src/client/pages/mainPage';

describe('MainPage', () => {
  it('renders content', () => {
    render(<MainPage />);

    const content = screen.getByText(`Hi, I'm the main page`);
    expect(content).toBeInTheDocument();
  });
});
