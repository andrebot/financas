import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PasswordField from '../../../../src/client/components/form/passwordField';

describe('PasswordField', () => {
  it('should render the password field', () => {
    render(<PasswordField label="Password" value="" onChange={() => {}} error={false} helperText="" />);

    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('should show the password when the show password button is clicked', () => {
    render(<PasswordField label="Password" value="" onChange={() => {}} error={true} helperText="Error" />);

    fireEvent.click(screen.getByRole('button', { name: 'display the password' }));

    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'text');
  });

  it('should trigger the default keydown event when the enter key is pressed', () => {
    render(<PasswordField label="Password" value="" onChange={() => {}} error={true} helperText="Error" />);

    fireEvent.keyDown(screen.getByLabelText('Password'), { key: 'Enter', code: 'Enter' });
  });
});
