import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';;
import i18n from '../../../src/client/i18n';
import LoadingPage from '../../../src/client/pages/loadingPage'; // Adjust the path as necessary

describe('LoadingPage', () => {
  it('renders loading message and progress circle', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LoadingPage />
      </I18nextProvider>
    );

    // Check if the "Loading..." text is rendered
    const loadingText = screen.getByText('Loading...');
    expect(loadingText).toBeInTheDocument();

    // Check if the CircularProgress component is rendered
    const progressCircle = screen.getByRole('progressbar');
    expect(progressCircle).toBeInTheDocument();
  });
});
