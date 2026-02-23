import React, {
  useReducer,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { enqueueSnackbar } from 'notistack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Box from '@mui/material/Box';
import { PickerValue } from '@mui/x-date-pickers/internals/models';
import { goalReducer, initialGoalState } from './goalReducer';
import { GoalActionType, GoalsTableActionType } from '../../enums';
import GoalsTable from './goalsTable';
import {
  GoalsMain,
  GoalsTableWrapper,
  SaveGoalButton,
  GoalsRowInput,
} from './styledComponents';
import {
  useCreateGoalMutation,
  useDeleteGoalMutation,
  useListGoalsQuery,
  useUpdateGoalMutation,
} from '../../features/goal';
import { useAuth } from '../../hooks/authContext';
import { useModal } from '../../components/modal/modal';
import ConfirmModal from '../../components/confirmModal';
import type { Goal } from '../../types';

const availableActions = [
  GoalsTableActionType.EDIT,
  GoalsTableActionType.DESELECT,
  GoalsTableActionType.ARCHIVE,
  GoalsTableActionType.DELETE,
];
const archivedAvailableActions = [
  GoalsTableActionType.UNARCHIVE,
  GoalsTableActionType.DELETE,
];

/**
 * Main component for the goals page. This has the logic for all the
 * Goal CRUD operations.
 *
 * Remember to add the transactions feature where we really calculate
 * the progress and add more details to each goal.
 *
 * @returns The goals page
 */
export default function Goals(): React.JSX.Element {
  const { t } = useTranslation();
  const { user } = useAuth();
  const goalNameAnchorRef = useRef<HTMLDivElement>(null);
  const { showModal, closeModal } = useModal();
  const { data: allGoals = [] } = useListGoalsQuery();
  const [createGoal] = useCreateGoalMutation();
  const [updateGoal] = useUpdateGoalMutation();
  const [deleteGoal] = useDeleteGoalMutation();

  const [goalState, dispatchGoal] = useReducer(goalReducer, initialGoalState);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [activeGoals, setActiveGoals] = useState<Goal[]>([]);
  const [archivedGoals, setArchivedGoals] = useState<Goal[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalsTableActions, setGoalsTableActions] = useState<GoalsTableActionType[]>(
    availableActions,
  );

  /**
   * Handles the change of the name of the goal.
   *
   * @remarks
   * Triggers the SET_NAME action to update the state.
   *
   * @param e - The event object
   * @returns The new state
   */
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatchGoal({ type: GoalActionType.SET_NAME, payload: e.target.value });
  };

  /**
   * Handles the change of the value of the goal.
   *
   * @remarks
   * Triggers the SET_VALUE action to update the state.
   *
   * @param e - The event object
   * @returns The new state
   */
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatchGoal({ type: GoalActionType.SET_VALUE, payload: Number(e.target.value) });
  };

  /**
   * Handles the change of the due date of the goal.
   *
   * @remarks
   * Triggers the SET_DUE_DATE action to update the state.
   *
   * @param e - The event object
   * @returns The new state
   */
  const handleDueDateChange = (e: PickerValue) => {
    dispatchGoal({ type: GoalActionType.SET_DUE_DATE, payload: e?.toDate() });
  };

  /**
   * Handles the start of the edit of the goal.
   *
   * @remarks
   * Triggers the EDIT action to update the state.
   *
   * @param goal - The goal to edit
   * @returns The new state
   */
  const handleStartEditGoal = (goal: Goal) => {
    dispatchGoal({ type: GoalActionType.EDIT, payload: goal });
  };

  /**
   * Handles the deselection of the goal.
   *
   * @remarks
   * Triggers the RESET action to update the state.
   *
   * @returns The new state
   */
  const handleDeselectGoal = () => {
    dispatchGoal({ type: GoalActionType.RESET });
  };

  /**
   * Handles the change of the tab of the goals.
   *
   * @remarks
   * This triggers the goals table to be updated
   * with the active or archived goals.
   *
   * @param event - The event object
   * @param newValue - The new value of the tab
   * @returns The new state
   */
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  /**
   * Updates a goal through the API.
   *
   * @param goal - The goal to save
   * @param successMessage - The success message to display
   * @param errorMessage - The error message to display
   * @returns The new state
   */
  const saveGoal = async (goal: Goal, successMessage: string, errorMessage: string) => {
    try {
      await updateGoal(goal).unwrap();

      enqueueSnackbar(t(successMessage), { variant: 'success' });
    } catch {
      enqueueSnackbar(t(errorMessage), { variant: 'error' });
    }
  };

  /**
   * Archives a goal through the API.
   *
   * @remarks
   * Just updates the archived flag to true.
   *
   * @param goal - The goal to archive
   * @returns The new state
   */
  const handleArchiveGoal = async (goal: Goal) => {
    saveGoal({ ...goal, archived: true }, 'goalArchived', 'goalArchiveFailed');
  };

  /**
   * Unarchives a goal through the API.
   *
   * @remarks
   * Just updates the archived flag to false.
   *
   * @param goal - The goal to unarchive
   * @returns The new state
   */
  const handleUnarchiveGoal = async (goal: Goal) => {
    saveGoal({ ...goal, archived: false }, 'goalUnarchived', 'goalUnarchiveFailed');
  };

  /**
   * Deletes a goal through the API.
   *
   * @param goal - The goal to delete
   * @returns The new state
   */
  const submitDeleteGoal = async (goal: Goal) => {
    try {
      await deleteGoal(goal.id!).unwrap();
      enqueueSnackbar(t('goalDeleted'), { variant: 'success' });
    } catch {
      enqueueSnackbar(t('goalDeletionFailed'), { variant: 'error' });
    } finally {
      closeModal();
    }
  };

  /**
   * Handles the deletion goal action by showing
   * the confirmation modal and setting the
   * callbacks to the modal.
   *
   * @param goal - The goal to delete
   * @returns The new state
   */
  const handleDeleteGoal = async (goal: Goal) => {
    showModal(
      <ConfirmModal
        title={t('deleteGoalModalTitle')}
        confirmationText={t('deleteGoalConfirmation')}
        onConfirm={() => submitDeleteGoal(goal)}
        onCancel={() => closeModal()}
      />,
    );
  };

  /**
   * Handles the saving of the goal in the goal form.
   * Since we create and update the goal in the same form,
   * we need to check if the goal is being created or updated
   * so we can use the correct mutation.
   *
   * @remarks
   * This triggers the creation or update of the goal.
   *
   * @returns The new state
   */
  const handleSaveGoal = async () => {
    if (goalState.dueDateError || goalState.valueError || goalState.nameError) {
      enqueueSnackbar(t('fixErrorsBeforeSaving'), { variant: 'error' });
      return;
    }

    const action = goalState.id ? updateGoal : createGoal;

    try {
      await action({
        id: goalState.id,
        name: goalState.name!,
        value: goalState.value,
        dueDate: goalState.dueDate!,
        archived: false,
        user: user!.id,
        savedValue: 0,
        progress: 0,
      }).unwrap();

      dispatchGoal({ type: GoalActionType.RESET });
      enqueueSnackbar(t('goalSaved'), { variant: 'success' });
      goalNameAnchorRef.current?.focus();
    } catch {
      enqueueSnackbar(t('goalCreationFailed'), { variant: 'error' });
    }
  };

  /**
   * Filters the goals by name.
   *
   * @param goals - The goals to filter
   * @returns The filtered goals
   */
  const filterGoals = useCallback(
    (goalsToFilter: Goal[]): Goal[] => goalsToFilter
      .filter((curGoal: Goal): boolean => curGoal.name
        .toLowerCase()
        .includes(
          search.toLowerCase(),
        )),
    [search],
  );

  /**
   * Calculates the progress of the goal.
   *
   * @param savedValue - The saved value of the goal
   * @param value - The value of the goal
   * @returns The progress of the goal
   */
  const calculateGoalProgress = (savedValue: number, value: number) => {
    if (!savedValue || Number.isNaN(savedValue)) {
      return 0;
    }

    return (savedValue / value) * 100;
  };

  /**
   * Handles the change of the active tab. Updated the goals
   * that needs to be displayed in the goals table and the
   * available actions in the goals table.
   *
   * @remarks
   * This triggers the goals table to be updated
   * with the active or archived goals.
   *
   * @returns The new state
   */
  useEffect(() => {
    if (activeTab === 0) {
      setGoals(activeGoals);
      setGoalsTableActions(availableActions);
    } else {
      setGoals(archivedGoals);
      setGoalsTableActions(archivedAvailableActions);
    }
  }, [activeTab, allGoals]);

  /**
   * After we fetch the goals from the API, we need
   * sort them into active and archived goals and
   * format them to be displayed in the goals table.
   *
   * @returns The new state
   */
  useEffect(() => {
    if (allGoals && allGoals.length > 0) {
      const [newActiveGoals, newArchivedGoals] = allGoals.reduce<[Goal[], Goal[]]>(
        ([active, archived], goal) => {
          const formattedGoal: Goal = {
            ...goal,
            progress: calculateGoalProgress(goal.savedValue, goal.value),
          };

          if (goal.archived) {
            archived.push(formattedGoal);
          } else {
            active.push(formattedGoal);
          }

          return [active, archived];
        },
        [[], []] as [Goal[], Goal[]],
      );

      setActiveGoals(newActiveGoals);
      setArchivedGoals(newArchivedGoals);

      if (activeTab === 0) {
        setGoals(newActiveGoals);
      } else {
        setGoals(newArchivedGoals);
      }
    }
  }, [allGoals]);

  return (
    <GoalsMain>
      <Typography variant="h2">{t('goals')}</Typography>
      <GoalsRowInput>
        <TextField
          label={t('goalName')}
          value={goalState.name}
          onChange={handleNameChange}
          error={!!t(goalState.nameError)}
          helperText={t(goalState.nameError)}
          slotProps={{
            input: {
              inputRef: goalNameAnchorRef,
            },
          }}
        />
        <TextField
          label={t('goalValue')}
          value={goalState.value}
          onChange={handleValueChange}
          error={!!t(goalState.valueError)}
          helperText={t(goalState.valueError)}
          slotProps={{
            input: {
              inputMode: 'decimal',
              startAdornment: <InputAdornment position="start">{t('currencySymbol')}</InputAdornment>,
            },
          }}
        />
        <DatePicker
          label={t('goalDueDate')}
          views={['year', 'month']}
          format="MM/YY"
          value={goalState.dueDate ? dayjs(goalState.dueDate) : null}
          onChange={handleDueDateChange}
          slotProps={{
            field: { readOnly: false },
            textField: {
              error: !!t(goalState.dueDateError),
              helperText: goalState.dueDateError ? t(goalState.dueDateError) : '',
              inputProps: { 'data-testid': 'credit-card-expiration-input' },
            },
          }}
        />
        <SaveGoalButton variant="contained" color="primary" onClick={handleSaveGoal}>{t('saveGoal')}</SaveGoalButton>
      </GoalsRowInput>
      <GoalsTableWrapper elevation={3}>
        <TextField
          label={t('searchByName')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
        />
        <Box>
          <Tabs value={activeTab} variant="fullWidth" onChange={handleTabChange}>
            <Tab label={t('active')} />
            <Tab label={t('archived')} />
          </Tabs>
        </Box>
        <GoalsTable
          goals={filterGoals(goals)}
          activeGoalId={goalState.id}
          availableActions={goalsTableActions}
          onArchiveGoal={handleArchiveGoal}
          onUnarchiveGoal={handleUnarchiveGoal}
          onDeleteGoal={handleDeleteGoal}
          onEditGoal={handleStartEditGoal}
          onDeselectGoal={handleDeselectGoal}
        />
      </GoalsTableWrapper>
    </GoalsMain>
  );
}
