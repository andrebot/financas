import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmModal from '../../../../src/client/components/confirmModal';

describe('ConfirmModal', () => {
  const defaultProps = {
    title: 'Confirm Action',
    confirmationText: 'Are you sure you want to proceed?',
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should render the title', () => {
    render(<ConfirmModal {...defaultProps} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Confirm Action' })).toBeInTheDocument();
  });

  it('should render the confirmation text', () => {
    render(<ConfirmModal {...defaultProps} />);

    expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
  });

  it('should render the Cancel and Confirm buttons', () => {
    render(<ConfirmModal {...defaultProps} />);

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
  });

  it('should call onConfirm when Confirm button is clicked', () => {
    render(<ConfirmModal {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('should call onCancel when Cancel button is clicked', () => {
    render(<ConfirmModal {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('should render different title and confirmation text when provided', () => {
    render(
      <ConfirmModal
        {...defaultProps}
        title="Delete Item"
        confirmationText="This action cannot be undone."
      />
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Delete Item' })).toBeInTheDocument();
    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
  });
});
