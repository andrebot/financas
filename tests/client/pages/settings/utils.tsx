import { fireEvent, screen, waitFor } from '@testing-library/react';
import i18nKeys from '../../../../src/client/i18n/en';

export const mockUser = {
  id: '1',
  email: 'john.doe@example.com',
  firstName: 'John',
  lastName: 'Doe',
};

export function fillUpSettingsForm(formInfo: {
  firstName: string;
  lastName: string;
  email: string;
} = mockUser) {
  const firstNameInput = screen.getByLabelText(i18nKeys.translation.firstName);
  const lastNameInput = screen.getByLabelText(i18nKeys.translation.lastName);
  const emailInput = screen.getByLabelText(i18nKeys.translation.email);

  fireEvent.change(firstNameInput, { target: { value: formInfo.firstName } });
  fireEvent.change(lastNameInput, { target: { value: formInfo.lastName } });
  fireEvent.change(emailInput, { target: { value: formInfo.email } });
}