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
  onKeyDown = () => {},
  className,
  error = false,
  helperText = '',
}: {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
  error?: boolean;
  helperText?: string;
}) {
  const [showPassword, setShowPassword] = useState(false);

  /**
   * Handles the click event for the show password button.
   */
  function handleClickShowPassword() {
    setShowPassword(!showPassword);
  }

  return (
    <TextField
      className={className}
      type={showPassword ? 'text' : 'password'}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      error={error}
      helperText={helperText}
      label={label}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              aria-label={showPassword ? 'hide the password' : 'display the password'}
              onClick={handleClickShowPassword}
              edge="end"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
}
