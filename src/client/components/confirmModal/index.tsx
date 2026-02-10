import { Button } from '@mui/material';
import React from 'react';
import { ConfirmModalContainer, ButtonHolded } from './styledComponents';
import type { ConfirmModalProps } from '../../types';

export default function ConfirmModal({ title, confirmationText, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <ConfirmModalContainer elevation={3}>
      <h1>{title}</h1>
      <p>{confirmationText}</p>
      <ButtonHolded>
        <Button onClick={onCancel} variant="contained" color="error">Cancel</Button>
        <Button onClick={onConfirm} variant="contained">Confirm</Button>
      </ButtonHolded>
    </ConfirmModalContainer>
  );
}
