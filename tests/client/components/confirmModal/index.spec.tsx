import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../../src/client/i18n';
import i18nEn from '../../../../src/client/i18n/en';
import ConfirmModal from '../../../../src/client/components/confirmModal';

describe('ConfirmModal', () => {
  const defaultProps = {
    title: 'Confirm Action',
    confirmationText: 'Are you sure you want to proceed?',
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  const setup = () =>
    render(
      <I18nextProvider i18n={i18n}>
        <ConfirmModal {...defaultProps} />
      </I18nextProvider>,
    );

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should render the title', () => {
    setup();

    expect(screen.getByRole('heading', { level: 1, name: 'Confirm Action' })).toBeInTheDocument();
  });

  it('should render the confirmation text', () => {
    setup();

    expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
  });

  it('should render the Cancel and Confirm buttons', () => {
    setup();

    expect(screen.getByRole('button', { name: i18nEn.translation.cancel })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: i18nEn.translation.confirm })).toBeInTheDocument();
  });

  it('should call onConfirm when Confirm button is clicked', () => {
    setup();

    fireEvent.click(screen.getByRole('button', { name: i18nEn.translation.confirm }));

    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('should call onCancel when Cancel button is clicked', () => {
    setup();

    fireEvent.click(screen.getByRole('button', { name: i18nEn.translation.cancel }));

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('should render different title and confirmation text when provided', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <ConfirmModal
          {...defaultProps}
          title="Delete Item"
          confirmationText="This action cannot be undone."
        />
      </I18nextProvider>,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Delete Item' })).toBeInTheDocument();
    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
  });
});
