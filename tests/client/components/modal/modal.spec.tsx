import React from 'react';
import { render, screen, fireEvent, renderHook } from '@testing-library/react';
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

  it('provides default no-op functions when used outside of ModalProvider', () => {
    // Render hook without wrapping it in ModalProvider
    const { result } = renderHook(() => useModal());

    // Assert that calling showModal and closeModal does not throw an error
    expect(result.current.showModal).toBeInstanceOf(Function);
    expect(result.current.closeModal).toBeInstanceOf(Function);

    // Call them to ensure they do nothing (no crash)
    expect(() => result.current.showModal(<p>Test</p>)).not.toThrow();
    expect(() => result.current.closeModal()).not.toThrow();
  });
});
