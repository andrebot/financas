import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../../../src/client/i18n';
import i18nEn from '../../../../../src/client/i18n/en';
import GoalsTable from '../../../../../src/client/pages/goals/goalsTable';
import { GoalsTableActionType } from '../../../../../src/client/enums';
import type { Goal, GoalsTableProps } from '../../../../../src/client/types';

const createGoal = (overrides: Partial<Goal> = {}): Goal => ({
  id: 'goal-1',
  name: 'Save for trip',
  value: 10000,
  dueDate: new Date('2026-12-31'),
  user: 'user-1',
  archived: false,
  savedValue: 0,
  progress: 33,
  ...overrides,
});

const defaultProps: GoalsTableProps = {
  goals: [],
  activeGoalId: undefined,
  availableActions: [
    GoalsTableActionType.EDIT,
    GoalsTableActionType.DELETE,
    GoalsTableActionType.ARCHIVE,
  ],
  onArchiveGoal: jest.fn(),
  onUnarchiveGoal: jest.fn(),
  onDeleteGoal: jest.fn(),
  onEditGoal: jest.fn(),
  onDeselectGoal: jest.fn(),
};

describe('GoalsTable', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  const setup = (props: Partial<GoalsTableProps> = {}) =>
    render(
      <I18nextProvider i18n={i18n}>
        <GoalsTable {...defaultProps} {...props} />
      </I18nextProvider>,
    );

  it('should render empty state when no goals', () => {
    setup();

    expect(screen.getByText(i18nEn.translation.goalsListEmpty)).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('should render table headers when goals are provided', () => {
    setup({ goals: [createGoal()] });

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText(i18nEn.translation.goalName)).toBeInTheDocument();
    expect(screen.getByText(i18nEn.translation.goalValue)).toBeInTheDocument();
    expect(screen.getByText(i18nEn.translation.goalDueDate)).toBeInTheDocument();
    expect(screen.getByText(i18nEn.translation.progress)).toBeInTheDocument();
    expect(screen.getByText(i18nEn.translation.actions)).toBeInTheDocument();
  });

  it('should render goal row with name, value, formatted due date and progress', () => {
    setup({
      goals: [
        createGoal({
          id: 'goal-1',
          name: 'Trip',
          value: 5000,
          dueDate: new Date('2026-06-15'),
          progress: 50,
        }),
      ],
    });

    expect(screen.getByText('Trip')).toBeInTheDocument();
    expect(screen.getByText('5000')).toBeInTheDocument();
    expect(screen.getByText('06/2026')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: '50%' })).toBeInTheDocument();
  });

  it('should render multiple goals', () => {
    setup({
      goals: [
        createGoal({ id: '1', name: 'Goal A', value: 1000 }),
        createGoal({ id: '2', name: 'Goal B', value: 2000 }),
      ],
    });

    expect(screen.getByText('Goal A')).toBeInTheDocument();
    expect(screen.getByText('Goal B')).toBeInTheDocument();
    expect(screen.getByText('1000')).toBeInTheDocument();
    expect(screen.getByText('2000')).toBeInTheDocument();
  });

  it('should call onEditGoal when Edit button is clicked', () => {
    const onEditGoal = jest.fn();
    const goal = createGoal({ id: 'goal-1', name: 'My goal' });

    setup({
      goals: [goal],
      onEditGoal,
      availableActions: [GoalsTableActionType.EDIT, GoalsTableActionType.DELETE, GoalsTableActionType.ARCHIVE],
    });

    fireEvent.click(screen.getByRole('button', { name: i18nEn.translation.edit }));

    expect(onEditGoal).toHaveBeenCalledTimes(1);
    expect(onEditGoal).toHaveBeenCalledWith(goal);
  });

  it('should call onDeleteGoal when Delete button is clicked', () => {
    const onDeleteGoal = jest.fn();
    const goal = createGoal({ id: 'goal-1', name: 'My goal' });

    setup({
      goals: [goal],
      onDeleteGoal,
    });

    fireEvent.click(screen.getByRole('button', { name: i18nEn.translation.delete }));

    expect(onDeleteGoal).toHaveBeenCalledTimes(1);
    expect(onDeleteGoal).toHaveBeenCalledWith(goal);
  });

  it('should call onArchiveGoal when Archive button is clicked', () => {
    const onArchiveGoal = jest.fn();
    const goal = createGoal({ id: 'goal-1', name: 'My goal' });

    setup({
      goals: [goal],
      onArchiveGoal,
    });

    fireEvent.click(screen.getByRole('button', { name: i18nEn.translation.archive }));

    expect(onArchiveGoal).toHaveBeenCalledTimes(1);
    expect(onArchiveGoal).toHaveBeenCalledWith(goal);
  });

  it('should call onUnarchiveGoal when Unarchive button is clicked', () => {
    const onUnarchiveGoal = jest.fn();
    const goal = createGoal({ id: 'goal-1', name: 'Archived goal', archived: true });

    setup({
      goals: [goal],
      onUnarchiveGoal,
      availableActions: [GoalsTableActionType.UNARCHIVE, GoalsTableActionType.DELETE],
    });

    fireEvent.click(screen.getByRole('button', { name: i18nEn.translation.unarchive }));

    expect(onUnarchiveGoal).toHaveBeenCalledTimes(1);
    expect(onUnarchiveGoal).toHaveBeenCalledWith(goal);
  });

  it('should call onDeselectGoal when Deselect button is clicked and activeGoalId is set', () => {
    const onDeselectGoal = jest.fn();
    const goal = createGoal({ id: 'goal-1', name: 'My goal' });

    setup({
      goals: [goal],
      activeGoalId: 'goal-1',
      onDeselectGoal,
      availableActions: [
        GoalsTableActionType.DESELECT,
        GoalsTableActionType.DELETE,
        GoalsTableActionType.ARCHIVE,
      ],
    });

    fireEvent.click(screen.getByRole('button', { name: 'deselect' }));

    expect(onDeselectGoal).toHaveBeenCalledTimes(1);
  });

  it('should hide Edit button when activeGoalId is set', () => {
    setup({
      goals: [createGoal({ id: 'goal-1', name: 'My goal' })],
      activeGoalId: 'goal-1',
      availableActions: [
        GoalsTableActionType.EDIT,
        GoalsTableActionType.DESELECT,
        GoalsTableActionType.DELETE,
        GoalsTableActionType.ARCHIVE,
      ],
    });

    expect(screen.queryByRole('button', { name: i18nEn.translation.edit })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'deselect' })).toBeInTheDocument();
  });

  it('should hide Deselect button when activeGoalId is not set', () => {
    setup({
      goals: [createGoal({ id: 'goal-1', name: 'My goal' })],
      availableActions: [
        GoalsTableActionType.EDIT,
        GoalsTableActionType.DESELECT,
        GoalsTableActionType.DELETE,
        GoalsTableActionType.ARCHIVE,
      ],
    });

    expect(screen.getByRole('button', { name: i18nEn.translation.edit })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'deselect' })).not.toBeInTheDocument();
  });

  it('should sort by value when Value column header is clicked', () => {
    setup({
      goals: [
        createGoal({ id: '1', name: 'High', value: 10000 }),
        createGoal({ id: '2', name: 'Low', value: 1000 }),
      ],
    });

    const valueHeader = screen.getByRole('button', { name: i18nEn.translation.goalValue });
    fireEvent.click(valueHeader);

    const rows = screen.getAllByRole('row').slice(1);
    expect(rows[0]).toHaveTextContent('Low');
    expect(rows[1]).toHaveTextContent('High');

    fireEvent.click(valueHeader);

    const rowsDesc = screen.getAllByRole('row').slice(1);
    expect(rowsDesc[0]).toHaveTextContent('High');
    expect(rowsDesc[1]).toHaveTextContent('Low');

    fireEvent.click(valueHeader);

    const rowsAscAgain = screen.getAllByRole('row').slice(1);
    expect(rowsAscAgain[0]).toHaveTextContent('Low');
    expect(rowsAscAgain[1]).toHaveTextContent('High');
  });

  it('should sort by due date when Due Date column header is clicked', () => {
    setup({
      goals: [
        createGoal({ id: '1', name: 'Later', dueDate: new Date('2027-12-31'), value: 1000 }),
        createGoal({ id: '2', name: 'Earlier', dueDate: new Date('2026-01-15'), value: 1000 }),
      ],
    });

    const dueDateHeader = screen.getByRole('button', { name: i18nEn.translation.goalDueDate });
    fireEvent.click(dueDateHeader);

    const rows = screen.getAllByRole('row').slice(1);
    expect(rows[0]).toHaveTextContent('Later');
    expect(rows[1]).toHaveTextContent('Earlier');
  });

  it('should sort by progress when Progress column header is clicked', () => {
    setup({
      goals: [
        createGoal({ id: '1', name: 'Full', value: 1000, progress: 100 }),
        createGoal({ id: '2', name: 'Half', value: 1000, progress: 50 }),
      ],
    });

    const progressHeader = screen.getByRole('button', { name: i18nEn.translation.progress });
    fireEvent.click(progressHeader);

    const rows = screen.getAllByRole('row').slice(1);
    expect(rows[0]).toHaveTextContent('Half');
    expect(rows[1]).toHaveTextContent('Full');
  });

  it('should mark row as selected when activeGoalId matches goal id', () => {
    const { container } = setup({
      goals: [
        createGoal({ id: 'goal-1', name: 'Selected' }),
        createGoal({ id: 'goal-2', name: 'Not selected' }),
      ],
      activeGoalId: 'goal-1',
      availableActions: [GoalsTableActionType.EDIT, GoalsTableActionType.DELETE],
    });

    const selectedRow = container.querySelector('.MuiTableRow-root.Mui-selected');
    expect(selectedRow).toBeInTheDocument();
    expect(selectedRow).toHaveTextContent('Selected');
  });
});
