import { Page } from "@playwright/test";

export const changeEmailUser = {
  email: `delete.me.change.email.${Date.now()}@gmail.com`,
  firstName: 'John',
  lastName: 'Doe',
  password: '$2b$10$28bW5R9ZyYOe/I3erH71/e8nWKmgd1ddiKbpPSFBjhaFIJJFDYRcS',
  createdAt: new Date('2025-02-06T20:35:00.065Z'),
  updatedAt: new Date('2025-02-06T20:35:00.065Z'),
  __v: 0
};

export const changePasswordUser = {
  email: `delete.me.change.password.${Date.now()}@gmail.com`,
  firstName: 'John',
  lastName: 'Doe',
  password: '$2b$10$28bW5R9ZyYOe/I3erH71/e8nWKmgd1ddiKbpPSFBjhaFIJJFDYRcS',
  createdAt: new Date('2025-02-06T20:35:00.065Z'),
  updatedAt: new Date('2025-02-06T20:35:00.065Z'),
  __v: 0
};

export async function goToSettingsPage(page: Page) {
  await page.getByRole('button', { name: /menu/i }).click();
  await page.getByRole('button', { name: /settings/i }).click();
}
