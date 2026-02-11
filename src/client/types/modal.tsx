import { ReactNode } from "react";

export type ModalContextType = {
  // eslint-disable-next-line no-unused-vars
  showModal: (modalContent: ReactNode) => void;
  closeModal: () => void;
};

export type ModalProviderProps = {
  children: ReactNode;
};