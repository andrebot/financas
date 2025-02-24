import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../src/client/i18n';
import MainPage from '../../../src/client/pages/mainPage';

jest.mock('../../../src/client/components/navBar', () => ({
  __esModule: true,
  default: () => <div>NavBar</div>,
}));

describe('MainPage', () => {
  it('renders content', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <MainPage />
      </I18nextProvider>
    );

    const content = screen.getByText(`NavBar`);
    expect(content).toBeInTheDocument();
  });
});
