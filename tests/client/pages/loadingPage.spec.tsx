import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import LoadingPage from '../../../src/client/pages/loadingPage'; // Adjust the path as necessary

describe('LoadingPage', () => {
  it('renders loading message and progress circle', () => {
    render(<LoadingPage />);

    // Check if the "Loading..." text is rendered
    const loadingText = screen.getByText('Loading...');
    expect(loadingText).toBeInTheDocument();

    // Check if the CircularProgress component is rendered
    const progressCircle = screen.getByRole('progressbar');
    expect(progressCircle).toBeInTheDocument();
  });
});
