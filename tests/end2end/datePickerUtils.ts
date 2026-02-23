import type { Locator, Page } from '@playwright/test';

type DatePickerScope = Page | Locator;

/**
 * Fills a MUI month/year field (MM/YY) by interacting with the Month and Year
 * spinbuttons. Use when the spinbuttons are already visible (e.g. inline credit
 * card expiry) or after opening the picker (e.g. by clicking the goals due date
 * field).
 *
 * Avoids strict mode by not using getByLabel (which can match both the visible
 * wrapper and the hidden input). Callers open the field if needed, then pass
 * the scope that contains the spinbuttons (page for a popover, or a modal
 * locator for inline fields).
 *
 * @param scope - Where the Month/Year spinbuttons live (page or modal/container)
 * @param monthYear - Value in MM/YY format (e.g. '12/27' or '01/30')
 */
export async function fillMuiMonthYear(
  scope: DatePickerScope,
  monthYear: string,
): Promise<void> {
  const [mm, yy] = monthYear.split('/');
  const monthSection = scope.getByRole('spinbutton', { name: 'Month' });
  await monthSection.click();
  await monthSection.pressSequentially(mm);
  await monthSection.press('Tab');
  const yearSection = scope.getByRole('spinbutton', { name: 'Year' });
  await yearSection.pressSequentially(yy.length === 2 ? `20${yy}` : yy);
  await yearSection.press('Tab');
}
