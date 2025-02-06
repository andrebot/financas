import { fireEvent, screen, waitFor } from '@testing-library/react';

export const mockRegisterData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  password: 'Maro-aji99',
  confirmPassword: 'Maro-aji99',
};

export function getFormInputs() {
  const firstNameInput = screen.getByLabelText(/first name/i);
  const lastNameInput = screen.getByLabelText(/last name/i);
  const emailInput = screen.getByLabelText(/email/i);
  const passwordInput = screen.getAllByLabelText(/password/i).filter((input: any) => input.tagName === 'INPUT')[0];
  const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

  return { firstNameInput, lastNameInput, emailInput, passwordInput, confirmPasswordInput };
}

export async function populateFormInputs(inputs: Record<string, HTMLElement>) {
  fireEvent.change(inputs.firstNameInput, { target: { value: mockRegisterData.firstName } });
  fireEvent.change(inputs.lastNameInput, { target: { value: mockRegisterData.lastName } });
  fireEvent.change(inputs.emailInput, { target: { value: mockRegisterData.email } });
  fireEvent.change(inputs.passwordInput, { target: { value: mockRegisterData.password } });
  fireEvent.change(inputs.confirmPasswordInput, { target: { value: mockRegisterData.confirmPassword } });

  await waitFor(() => {
    expect(inputs.firstNameInput).toHaveValue(mockRegisterData.firstName);
    expect(inputs.lastNameInput).toHaveValue(mockRegisterData.lastName);
    expect(inputs.emailInput).toHaveValue(mockRegisterData.email);
    expect(inputs.passwordInput).toHaveValue(mockRegisterData.password);
    expect(inputs.confirmPasswordInput).toHaveValue(mockRegisterData.confirmPassword);
  });
}