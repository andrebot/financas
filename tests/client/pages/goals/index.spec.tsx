import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { enqueueSnackbar } from 'notistack';
import i18n from '../../../../src/client/i18n';
import i18nEn from '../../../../src/client/i18n/en';
import Goals from '../../../../src/client/pages/goals';
import { useModal } from '../../../../src/client/components/modal/modal';
import { useAuth } from '../../../../src/client/hooks/authContext';
import {
  useListGoalsQuery,
  useCreateGoalMutation,
  useUpdateGoalMutation,
  useDeleteGoalMutation,
} from '../../../../src/client/features/goal';
import type { Goal } from '../../../../src/client/types';

jest.mock('notistack', () => ({
  enqueueSnackbar: jest.fn(),
}));

jest.mock('../../../../src/client/components/modal/modal', () => ({
  useModal: jest.fn(),
}));

jest.mock('../../../../src/client/hooks/authContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../../../src/client/features/goal', () => ({
  useListGoalsQuery: jest.fn(),
  useCreateGoalMutation: jest.fn(),
  useUpdateGoalMutation: jest.fn(),
  useDeleteGoalMutation: jest.fn(),
}));

describe('Goals page', () => {
  const mockShowModal = jest.fn();
  const mockCloseModal = jest.fn();
  const mockCreateGoal = jest.fn();
  const mockUpdateGoal = jest.fn();
  const mockDeleteGoal = jest.fn();

  const mockUser = { id: 'user-1', email: 'test@test.com', firstName: 'Test', lastName: 'User', role: 'user' };

  const createMockGoal = (overrides: Partial<Goal> = {}): Goal => ({
    id: 'goal-1',
    name: 'Save for trip',
    value: 10000,
    dueDate: new Date('2026-12-31'),
    user: 'user-1',
    archived: false,
    savedValue: 0,
    progress: 0,
    ...overrides,
  });

  beforeEach(() => {
    jest.resetAllMocks();

    (useModal as jest.Mock).mockReturnValue({ showModal: mockShowModal, closeModal: mockCloseModal });
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (useListGoalsQuery as jest.Mock).mockReturnValue({
      data: [createMockGoal()],
    });
    (useCreateGoalMutation as jest.Mock).mockReturnValue([
      mockCreateGoal,
      { isError: false, isSuccess: false },
    ]);
    (useUpdateGoalMutation as jest.Mock).mockReturnValue([
      mockUpdateGoal,
      { isError: false, isSuccess: false },
    ]);
    (useDeleteGoalMutation as jest.Mock).mockReturnValue([
      mockDeleteGoal,
      { isError: false, isSuccess: false },
    ]);
  });

  const goalsPageJSX = (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <I18nextProvider i18n={i18n}>
        <Goals />
      </I18nextProvider>
    </LocalizationProvider>
  );

  const setup = () => render(goalsPageJSX);

  it('should render goals title, form fields, save button, search and tabs', () => {
    setup();

    expect(screen.getByText(i18nEn.translation.goals)).toBeInTheDocument();
    expect(screen.getByLabelText(i18nEn.translation.goalName)).toBeInTheDocument();
    expect(screen.getByLabelText(i18nEn.translation.goalValue)).toBeInTheDocument();
    expect(screen.getByTestId('credit-card-expiration-input')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: i18nEn.translation.saveGoal })).toBeInTheDocument();
    expect(screen.getByLabelText(i18nEn.translation.searchByName)).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: i18nEn.translation.active })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: i18nEn.translation.archived })).toBeInTheDocument();
  });

  it('should render empty state when no goals', () => {
    (useListGoalsQuery as jest.Mock).mockReturnValue({ data: [] });

    setup();

    expect(screen.getByText(i18nEn.translation.goalsListEmpty)).toBeInTheDocument();
  });

  it('should use default empty array when useListGoalsQuery returns no data', () => {
    (useListGoalsQuery as jest.Mock).mockReturnValue({});

    setup();

    expect(screen.getByText(i18nEn.translation.goalsListEmpty)).toBeInTheDocument();
  });

  it('should render goals in table when data is returned', () => {
    setup();

    expect(screen.getByText('Save for trip')).toBeInTheDocument();
    expect(screen.getByText('10000')).toBeInTheDocument();
  });

  it('should filter goals by search input', () => {
    (useListGoalsQuery as jest.Mock).mockReturnValue({
      data: [
        createMockGoal({ id: '1', name: 'Trip' }),
        createMockGoal({ id: '2', name: 'Car' }),
      ],
    });

    setup();

    expect(screen.getByText('Trip')).toBeInTheDocument();
    expect(screen.getByText('Car')).toBeInTheDocument();

    const searchInput = screen.getByLabelText(i18nEn.translation.searchByName);
    fireEvent.change(searchInput, { target: { value: 'Trip' } });

    expect(screen.getByText('Trip')).toBeInTheDocument();
    expect(screen.queryByText('Car')).not.toBeInTheDocument();
  });

  it('should show fixErrorsBeforeSaving when saving with validation errors', () => {
    setup();

    const nameInput = screen.getByLabelText(i18nEn.translation.goalName);
    fireEvent.change(nameInput, { target: { value: 'x' } });
    fireEvent.change(nameInput, { target: { value: '' } });

    fireEvent.click(screen.getByRole('button', { name: i18nEn.translation.saveGoal }));

    expect(enqueueSnackbar).toHaveBeenCalledWith(i18nEn.translation.fixErrorsBeforeSaving, {
      variant: 'error',
    });
    expect(mockCreateGoal).not.toHaveBeenCalled();
  });

  it('should show translated dueDateError on due date field when due date is in the past', () => {
    setup();

    const dueDateInput = screen.getByTestId('credit-card-expiration-input');
    fireEvent.change(dueDateInput, { target: { value: '01/20' } });
    fireEvent.blur(dueDateInput);

    expect(screen.getByText(i18nEn.translation.dueDateMustBeAfterToday)).toBeInTheDocument();
  });

  it('should show fixErrorsBeforeSaving when saving with dueDateError', () => {
    setup();

    const dueDateInput = screen.getByTestId('credit-card-expiration-input');
    fireEvent.change(dueDateInput, { target: { value: '01/20' } });
    fireEvent.blur(dueDateInput);

    fireEvent.click(screen.getByRole('button', { name: i18nEn.translation.saveGoal }));

    expect(enqueueSnackbar).toHaveBeenCalledWith(i18nEn.translation.fixErrorsBeforeSaving, {
      variant: 'error',
    });
    expect(mockCreateGoal).not.toHaveBeenCalled();
  });

  it('should call createGoal when saving valid new goal', async () => {
    mockCreateGoal.mockReturnValue({ unwrap: () => Promise.resolve(createMockGoal()) });

    setup();

    fireEvent.change(screen.getByLabelText(i18nEn.translation.goalName), {
      target: { value: 'New goal' },
    });
    fireEvent.change(screen.getByLabelText(i18nEn.translation.goalValue), {
      target: { value: '5000' },
    });

    fireEvent.click(screen.getByRole('button', { name: i18nEn.translation.saveGoal }));

    await waitFor(() => {
      expect(mockCreateGoal).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New goal',
          value: 5000,
          user: mockUser.id,
          archived: false,
          savedValue: 0,
          progress: 0,
        }),
      );
    });
  });

  it('should show goalSaved when create succeeds', async () => {
    mockCreateGoal.mockReturnValue({ unwrap: () => Promise.resolve(createMockGoal()) });

    setup();

    fireEvent.change(screen.getByLabelText(i18nEn.translation.goalName), {
      target: { value: 'New goal' },
    });
    fireEvent.change(screen.getByLabelText(i18nEn.translation.goalValue), {
      target: { value: '5000' },
    });

    fireEvent.click(screen.getByRole('button', { name: i18nEn.translation.saveGoal }));

    await waitFor(() => {
      expect(enqueueSnackbar).toHaveBeenCalledWith(i18nEn.translation.goalSaved, {
        variant: 'success',
      });
    });
  });

  it('should show goalCreationFailed when create fails', async () => {
    mockCreateGoal.mockReturnValue({ unwrap: () => Promise.reject(new Error('Failed')) });

    setup();

    fireEvent.click(screen.getByRole('button', { name: i18nEn.translation.saveGoal }));

    await waitFor(() => {
      expect(enqueueSnackbar).toHaveBeenCalledWith(i18nEn.translation.goalCreationFailed, {
        variant: 'error',
      });
    });
  });

  it('should fill form and call updateGoal when edit then save', async () => {
    mockUpdateGoal.mockReturnValue({ unwrap: () => Promise.resolve(createMockGoal()) });

    setup();

    fireEvent.click(screen.getByRole('button', { name: i18nEn.translation.edit }));

    expect((screen.getByLabelText(i18nEn.translation.goalName) as HTMLInputElement).value).toBe('Save for trip');
    expect((screen.getByLabelText(i18nEn.translation.goalValue) as HTMLInputElement).value).toBe('10000');

    fireEvent.click(screen.getByRole('button', { name: i18nEn.translation.saveGoal }));

    await waitFor(() => {
      expect(mockUpdateGoal).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'goal-1',
          name: 'Save for trip',
          value: 10000,
          user: mockUser.id,
          archived: false,
        }),
      );
      expect(enqueueSnackbar).toHaveBeenCalledWith(i18nEn.translation.goalSaved, {
        variant: 'success',
      });
    });
  });

  it('should open delete confirmation modal when clicking delete', () => {
    setup();

    fireEvent.click(screen.getByRole('button', { name: i18nEn.translation.delete }));

    expect(mockShowModal).toHaveBeenCalledTimes(1);
    const modalElement = mockShowModal.mock.calls[0][0] as React.ReactElement<{
      title: string;
      confirmationText: string;
    }>;
    expect(modalElement.props.title).toBe(i18nEn.translation.deleteGoalModalTitle);
    expect(modalElement.props.confirmationText).toBe(i18nEn.translation.deleteGoalConfirmation);
  });

  it('should call deleteGoal when confirm delete is clicked', async () => {
    mockDeleteGoal.mockReturnValue({ unwrap: () => Promise.resolve() });

    setup();

    fireEvent.click(screen.getByRole('button', { name: i18nEn.translation.delete }));

    const modalElement = mockShowModal.mock.calls[0][0] as React.ReactElement;
    const props = modalElement.props as { onConfirm: () => void };
    props.onConfirm();

    await waitFor(() => {
      expect(mockDeleteGoal).toHaveBeenCalledWith('goal-1');
    });
  });

  it('should show goalDeleted and close modal when delete succeeds', async () => {
    mockDeleteGoal.mockReturnValue({ unwrap: () => Promise.resolve() });

    setup();

    fireEvent.click(screen.getByRole('button', { name: i18nEn.translation.delete }));

    const modalElement = mockShowModal.mock.calls[0][0] as React.ReactElement;
    const props = modalElement.props as { onConfirm: () => void };
    props.onConfirm();

    await waitFor(() => {
      expect(enqueueSnackbar).toHaveBeenCalledWith(i18nEn.translation.goalDeleted, {
        variant: 'success',
      });
      expect(mockCloseModal).toHaveBeenCalled();
    });
  });

  it('should show goalDeletionFailed when delete fails', async () => {
    mockDeleteGoal.mockReturnValue({ unwrap: () => Promise.reject(new Error('Failed')) });

    setup();

    fireEvent.click(screen.getByRole('button', { name: i18nEn.translation.delete }));

    const modalElement = mockShowModal.mock.calls[0][0] as React.ReactElement;
    const props = modalElement.props as { onConfirm: () => void };
    props.onConfirm();

    await waitFor(() => {
      expect(enqueueSnackbar).toHaveBeenCalledWith(i18nEn.translation.goalDeletionFailed, {
        variant: 'error',
      });
      expect(mockCloseModal).toHaveBeenCalled();
    });
  });

  it('should close modal when cancel is clicked in delete confirmation', () => {
    setup();

    fireEvent.click(screen.getByRole('button', { name: i18nEn.translation.delete }));

    const modalElement = mockShowModal.mock.calls[0][0] as React.ReactElement;
    const props = modalElement.props as { onCancel: () => void };
    props.onCancel();

    expect(mockCloseModal).toHaveBeenCalled();
    expect(mockDeleteGoal).not.toHaveBeenCalled();
  });

  it('should call updateGoal with archived true when archive is clicked', async () => {
    mockUpdateGoal.mockReturnValue({ unwrap: () => Promise.resolve() });

    setup();

    fireEvent.click(screen.getByRole('button', { name: i18nEn.translation.archive }));

    await waitFor(() => {
      expect(mockUpdateGoal).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'goal-1',
          name: 'Save for trip',
          archived: true,
        }),
      );
      expect(enqueueSnackbar).toHaveBeenCalledWith(i18nEn.translation.goalArchived, {
        variant: 'success',
      });
    });
  });

  it('should show goalArchiveFailed when archive fails', async () => {
    mockUpdateGoal.mockReturnValue({ unwrap: () => Promise.reject(new Error('Failed')) });

    setup();

    fireEvent.click(screen.getByRole('button', { name: i18nEn.translation.archive }));

    await waitFor(() => {
      expect(enqueueSnackbar).toHaveBeenCalledWith(i18nEn.translation.goalArchiveFailed, {
        variant: 'error',
      });
    });
  });

  it('should show archived goals when switching to archived tab', () => {
    (useListGoalsQuery as jest.Mock).mockReturnValue({
      data: [
        createMockGoal({ id: 'active-1', name: 'Active goal', archived: false }),
        createMockGoal({ id: 'archived-1', name: 'Archived goal', archived: true }),
      ],
    });

    setup();

    expect(screen.getByText('Active goal')).toBeInTheDocument();
    expect(screen.queryByText('Archived goal')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: i18nEn.translation.archived }));

    expect(screen.getByText('Archived goal')).toBeInTheDocument();
    expect(screen.queryByText('Active goal')).not.toBeInTheDocument();
  });

  it('should set goals to archived when allGoals loads while on archived tab', async () => {
    const goalsData = [
      createMockGoal({ id: 'active-1', name: 'Active goal', archived: false }),
      createMockGoal({ id: 'archived-1', name: 'Archived goal', archived: true }),
    ];
    let callCount = 0;
    (useListGoalsQuery as jest.Mock).mockImplementation(() => {
      callCount += 1;
      return { data: callCount <= 1 ? [] : goalsData };
    });

    setup();

    fireEvent.click(screen.getByRole('tab', { name: i18nEn.translation.archived }));

    await waitFor(() => {
      expect(screen.getByText('Archived goal')).toBeInTheDocument();
    });
    expect(screen.queryByText('Active goal')).not.toBeInTheDocument();
  });

  it('should show goalUnarchiveFailed when unarchive fails', async () => {
    mockUpdateGoal.mockReturnValue({ unwrap: () => Promise.reject(new Error('Failed')) });

    (useListGoalsQuery as jest.Mock).mockReturnValue({
      data: [createMockGoal({ id: 'archived-1', name: 'Archived goal', archived: true })],
    });

    setup();

    fireEvent.click(screen.getByRole('tab', { name: i18nEn.translation.archived }));
    fireEvent.click(screen.getByRole('button', { name: i18nEn.translation.unarchive }));

    await waitFor(() => {
      expect(enqueueSnackbar).toHaveBeenCalledWith(i18nEn.translation.goalUnarchiveFailed, {
        variant: 'error',
      });
    });
  });

  it('should calculate and display progress when goal has savedValue', () => {
    (useListGoalsQuery as jest.Mock).mockReturnValue({
      data: [
        createMockGoal({
          id: 'goal-1',
          name: 'Half saved',
          value: 10000,
          savedValue: 5000,
          progress: 0,
        }),
      ],
    });

    setup();

    expect(screen.getByText('Half saved')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: '50%' })).toBeInTheDocument();
  });

  it('should call updateGoal with archived false when unarchive is clicked', async () => {
    mockUpdateGoal.mockReturnValue({ unwrap: () => Promise.resolve() });

    (useListGoalsQuery as jest.Mock).mockReturnValue({
      data: [createMockGoal({ id: 'archived-1', name: 'Archived goal', archived: true })],
    });

    setup();

    fireEvent.click(screen.getByRole('tab', { name: i18nEn.translation.archived }));

    fireEvent.click(screen.getByRole('button', { name: i18nEn.translation.unarchive }));

    await waitFor(() => {
      expect(mockUpdateGoal).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'archived-1',
          name: 'Archived goal',
          archived: false,
        }),
      );
      expect(enqueueSnackbar).toHaveBeenCalledWith(i18nEn.translation.goalUnarchived, {
        variant: 'success',
      });
    });
  });

  it('should reset form when deselect is clicked after editing', () => {
    setup();

    fireEvent.click(screen.getByRole('button', { name: i18nEn.translation.edit }));

    expect((screen.getByLabelText(i18nEn.translation.goalName) as HTMLInputElement).value).toBe('Save for trip');

    fireEvent.click(screen.getByRole('button', { name: 'deselect' }));

    expect((screen.getByLabelText(i18nEn.translation.goalName) as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText(i18nEn.translation.goalValue) as HTMLInputElement).value).toBe('0');
  });
});
