import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import dayjs from 'dayjs';
import DashboardHeader from '../../../../../../src/client/pages/transactions/dashboard/dashboardHeader';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

describe('DashboardHeader', () => {
  const currentYear = dayjs().year();
  const defaultProps = {
    selectedYear: currentYear,
    selectedMonth: 0,
    oldestYear: currentYear - 3,
    onYearChange: jest.fn(),
    onMonthChange: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  const setup = (props = {}) =>
    render(<DashboardHeader {...defaultProps} {...props} />);

  it('renders the selected year', () => {
    setup();
    expect(screen.getByText(String(currentYear))).toBeInTheDocument();
  });

  it('left chevron is disabled when selectedYear equals oldestYear', () => {
    setup({ selectedYear: currentYear - 3, oldestYear: currentYear - 3 });
    const buttons = screen.getAllByRole('button');
    // First button is the left chevron
    expect(buttons[0]).toBeDisabled();
  });

  it('left chevron is enabled when selectedYear is greater than oldestYear', () => {
    setup({ selectedYear: currentYear - 1, oldestYear: currentYear - 3 });
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).not.toBeDisabled();
  });

  it('right chevron is disabled when selectedYear equals currentYear', () => {
    setup({ selectedYear: currentYear });
    const buttons = screen.getAllByRole('button');
    // Second button is the right chevron
    expect(buttons[1]).toBeDisabled();
  });

  it('right chevron is enabled when selectedYear is less than currentYear', () => {
    setup({ selectedYear: currentYear - 1 });
    const buttons = screen.getAllByRole('button');
    expect(buttons[1]).not.toBeDisabled();
  });

  it('clicking left chevron calls onYearChange with selectedYear - 1', () => {
    const onYearChange = jest.fn();
    setup({ selectedYear: currentYear - 1, onYearChange });
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(onYearChange).toHaveBeenCalledWith(currentYear - 2);
  });

  it('clicking right chevron calls onYearChange with selectedYear + 1', () => {
    const onYearChange = jest.fn();
    setup({ selectedYear: currentYear - 1, onYearChange });
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]);
    expect(onYearChange).toHaveBeenCalledWith(currentYear);
  });

  it('clicking a month tab calls onMonthChange with its index', () => {
    const onMonthChange = jest.fn();
    setup({ onMonthChange });
    // February is index 1
    const febTab = screen.getByRole('tab', { name: /Feb/i });
    fireEvent.click(febTab);
    expect(onMonthChange).toHaveBeenCalledWith(1);
  });

  it('clicking the year label opens the year dropdown menu', () => {
    setup({ selectedYear: currentYear - 1, oldestYear: currentYear - 3 });
    const yearLabel = screen.getByText(String(currentYear - 1));
    fireEvent.click(yearLabel);
    // MUI Menu renders items as 'menuitem' role
    expect(screen.getAllByRole('menuitem').length).toBeGreaterThan(0);
  });

  it('selecting a year from the menu calls onYearChange with that year', () => {
    const onYearChange = jest.fn();
    const oldestYear = currentYear - 3;
    setup({ selectedYear: currentYear, oldestYear, onYearChange });
    const yearLabel = screen.getByText(String(currentYear));
    fireEvent.click(yearLabel);
    const targetYear = currentYear - 2;
    const menuItem = screen.getByRole('menuitem', { name: String(targetYear) });
    fireEvent.click(menuItem);
    expect(onYearChange).toHaveBeenCalledWith(targetYear);
  });

  it('closing the year menu without selecting a year hides the menu', () => {
    setup({ selectedYear: currentYear - 1, oldestYear: currentYear - 3 });
    const yearLabel = screen.getByText(String(currentYear - 1));
    fireEvent.click(yearLabel);
    expect(screen.getAllByRole('menuitem').length).toBeGreaterThan(0);
    // Close by pressing Escape
    fireEvent.keyDown(document.activeElement || document.body, { key: 'Escape' });
    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
  });
});
