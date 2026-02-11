import { Button } from '@mui/material';
import React from 'react';
import { ConfirmModalContainer, ButtonHolded } from './styledComponents';
import type { ConfirmModalProps } from '../../types';

/**
 * Confirm modal component. This component displays a confirm modal with a title, confirmation text, and a confirm and cancel button.
 *
 * @param title - The title of the modal
 * @param confirmationText - The confirmation text of the modal
 * @param onConfirm - The function to call when the confirm button is clicked
 * @param onCancel - The function to call when the cancel button is clicked
 * @returns The confirm modal component
 */
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
