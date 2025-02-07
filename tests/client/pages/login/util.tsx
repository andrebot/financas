import { fireEvent, screen, waitFor } from '@testing-library/react';
import type { UserType } from '../../../../src/client/types/user';

export const mockLoginData: UserType = {
  id: '1',
  email: 'test@test.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'user',
};

export const mockPassword = 'password';

export async function loginWithMockData() {
  const emailInput = screen.getByLabelText(/email/i);
  const passwordInput = screen.getAllByLabelText(/password/i)[0];
  const loginButton = screen.getByRole('button', { name: /login/i });

  fireEvent.change(emailInput, { target: { value: mockLoginData.email } });
  fireEvent.change(passwordInput, { target: { value: mockPassword } });

  await waitFor(() => {
    expect(emailInput).toHaveValue(mockLoginData.email);
    expect(passwordInput).toHaveValue(mockPassword);
  });

  fireEvent.click(loginButton);
}
