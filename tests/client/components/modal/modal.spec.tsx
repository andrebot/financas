import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ModalProvider, { useModal } from '../../../../src/client/components/modal/modal';

const TestComponent = () => {
  const { showModal, closeModal } = useModal();
  return (
    <>
      <button onClick={() => showModal(<p>Test Modal Content</p>)}>Show Modal</button>
      <button onClick={closeModal}>Close Modal</button>
    </>
  );
};

describe('ModalProvider and useModal', () => {
  it('shows and closes the modal', () => {
    render(
      <ModalProvider>
        <TestComponent />
      </ModalProvider>
    );

    // Click 'Show Modal' button to open the modal
    fireEvent.click(screen.getByText('Show Modal'));
    expect(screen.getByText('Test Modal Content')).toBeInTheDocument();

    // Click 'Close Modal' button to close the modal
    fireEvent.click(screen.getByText('Close Modal'));
    expect(screen.queryByText('Test Modal Content')).not.toBeInTheDocument();
  });
});
