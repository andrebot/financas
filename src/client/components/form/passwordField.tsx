import React, { useState } from 'react';
import {
  VisibilityOff,
  Visibility,
} from '@mui/icons-material';
import {
  IconButton,
  InputAdornment,
  TextField,
} from '@mui/material';

/**
 * A password field component that allows the user to input a password with a show password button.
 * 
 * @param label - The label of the password field.
 * @param value - The value of the password field.
 * @param onChange - The function to call when the password field changes.
 * @param error - Whether the password field has an error.
 * @param helperText - The helper text of the password field.
 * 
 * @returns The password field component.
 */
export default function PasswordField({
  label,
  value,
  onChange,
  error,
  helperText,
}: {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error: boolean;
  helperText: string;
}) {
  const [showPassword, setShowPassword] = useState(false);

  /**
   * Handles the click event for the show password button.
   */
  function handleClickShowPassword() {
    setShowPassword(!showPassword);
  }

  /**
   * Handles the mouse down event for the show password button.
   * 
   * @param event - The mouse down event.
   */
  function handleMouseDownPassword(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
  }

  /**
   * Handles the mouse up event for the show password button.
   * 
   * @param event - The mouse up event.
   */
  function handleMouseUpPassword(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
  }

  return (
    <TextField
      type={showPassword ? 'text' : 'password'}
      value={value}
      onChange={onChange}
      error={error}
      helperText={helperText}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              aria-label={showPassword ? 'hide the password' : 'display the password'}
              onClick={handleClickShowPassword}
              onMouseDown={handleMouseDownPassword}
              onMouseUp={handleMouseUpPassword}
              edge="end"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      }}
      label={label}
    />
  );
}
