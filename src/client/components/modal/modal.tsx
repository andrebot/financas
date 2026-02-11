import React, {
  useState,
  createContext,
  useContext,
  useMemo,
  ReactNode,
} from 'react';
import Modal from '@mui/material/Modal';

import ModalWrapper from './styledComponent';
import type { ModalContextType, ModalProviderProps } from '../../types';

const ModalContext = createContext<ModalContextType>({
  showModal: () => {},
  closeModal: () => {},
});

/**
 * Creating the Modal's context so we can use this component in the
 * entire application
 *
 * @returns The modal context
 */
export function useModal() {
  const { showModal, closeModal } = useContext(ModalContext);

  return { showModal, closeModal };
}

/**
 * Creates a provider to provide a modal to the entire application
 * to optmize memory usage.
 *
 * @param Params React default parameters
 * @returns the Modal provider
 */
export default function ModalProvider({ children }: ModalProviderProps) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState<ReactNode | null>(null);

  /**
   * Shows the modal by setting the content and opening the modal.
   *
   * @param modalContent - The content to show in the modal
   */
  const showModal = (modalContent: ReactNode) => {
    setContent(modalContent);
    setOpen(true);
  };

  /**
   * Closes the modal by setting the open state to false.
   */
  const closeModal = () => setOpen(false);

  /**
   * Creates the context value to be used in the modal provider.
   *
   * @returns The context value
   */
  const contextValue = useMemo(() => ({ showModal, closeModal }), []);

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
      <Modal open={open} onClose={closeModal}>
        <ModalWrapper>
          {content}
        </ModalWrapper>
      </Modal>
    </ModalContext.Provider>
  );
}
