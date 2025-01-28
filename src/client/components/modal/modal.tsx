import React, {
  useState,
  createContext,
  useContext,
  useMemo,
  ReactNode,
} from 'react';
import Modal from '@mui/material/Modal';

import ModalWrapper from './styledComponent';

type ModalContextType = {
  // eslint-disable-next-line no-unused-vars
  showModal: (modalContent: ReactNode) => void;
  closeModal: () => void;
};

type ModalProviderProps = {
  children: ReactNode;
};

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

  const showModal = (modalContent: ReactNode) => {
    setContent(modalContent);
    setOpen(true);
  };

  const closeModal = () => setOpen(false);

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
