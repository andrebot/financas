import { Theme } from '@mui/material';

export type StyleCompProp = {
  theme: Theme;
};

export type ConfirmModalProps = {
  title: string;
  confirmationText: string;
  onConfirm: () => void;
  onCancel: () => void;
};
