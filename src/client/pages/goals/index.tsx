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
import { RowInput } from '../../components/formStyledComponents';
import { goalReducer, initialGoalState } from './goalReducer';
import { GoalActionType, GoalsTableActionType } from '../../enums';
import GoalsTable from './goalsTable';
import {
  GoalsMain,
  GoalsTableWrapper,
  SaveGoalButton,
} from './styledComponents';
import type { Goal } from '../../types';
import { useCreateGoalMutation, useDeleteGoalMutation, useListGoalsQuery, useUpdateGoalMutation } from '../../features/goal';
import { useAuth } from '../../hooks/authContext';
import { useModal } from '../../components/modal/modal';
import ConfirmModal from '../../components/confirmModal';

const availableActions =  [GoalsTableActionType.EDIT, GoalsTableActionType.DESELECT, GoalsTableActionType.ARCHIVE, GoalsTableActionType.DELETE];
const archivedAvailableActions = [GoalsTableActionType.UNARCHIVE, GoalsTableActionType.DELETE];

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
  const [goalsTableActions, setGoalsTableActions] = useState<GoalsTableActionType[]>(availableActions);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatchGoal({ type: GoalActionType.SET_NAME, payload: e.target.value });
  }

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatchGoal({ type: GoalActionType.SET_VALUE, payload: Number(e.target.value) });
  }

  const handleDueDateChange = (e: PickerValue) => {
    dispatchGoal({ type: GoalActionType.SET_DUE_DATE, payload: e?.toDate() });
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  }

  const handleStartEditGoal = (goal: Goal) => {
    dispatchGoal({ type: GoalActionType.EDIT, payload: goal });
  }

  const saveGoal = async (goal: Goal, successMessage: string, errorMessage: string) => {
    try {
      await updateGoal(goal).unwrap();
      
      enqueueSnackbar(t(successMessage), { variant: 'success' });
    } catch {
      enqueueSnackbar(t(errorMessage), { variant: 'error' });
    }
  }

  const handleArchiveGoal = async (goal: Goal) => {
    saveGoal({ ...goal, archived: true }, 'goalArchived', 'goalArchiveFailed');
  }

  const handleUnarchiveGoal = async (goal: Goal) => {
    saveGoal({ ...goal, archived: false }, 'goalUnarchived', 'goalUnarchiveFailed');
  }

  const submitDeleteGoal = async (goal: Goal) => {
    try {
      await deleteGoal(goal.id!).unwrap();
      enqueueSnackbar(t('goalDeleted'), { variant: 'success' });
    } catch {
      enqueueSnackbar(t('goalDeletionFailed'), { variant: 'error' });
    } finally {
      closeModal();
    }
  }

  const handleDeleteGoal = async (goal: Goal) => {
    showModal(
      <ConfirmModal
        title={t('deleteGoalModalTitle')}
        confirmationText={t('deleteGoalConfirmation')}
        onConfirm={() => submitDeleteGoal(goal)}
        onCancel={() => closeModal()}
      />,
    );
  }

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
  }

  const handleDeselectGoal = () => {
    dispatchGoal({ type: GoalActionType.RESET });
  }

  const filterGoals = useCallback((goals: Goal[]) => {
    return goals.filter((goal) => goal.name.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  const calculateGoalProgress = (savedValue: number, value: number) => {
    if (!savedValue || Number.isNaN(savedValue)) {
      return 0;
    }

    return (savedValue / value) * 100;
  }

  useEffect(() => {
    if (activeTab === 0) {
      setGoals(activeGoals);
      setGoalsTableActions(availableActions);
    } else {
      setGoals(archivedGoals);
      setGoalsTableActions(archivedAvailableActions);
    }
  }, [activeTab, allGoals]);

  useEffect(() => {
    if (allGoals && allGoals.length > 0) {
      const [active, archived] = allGoals.reduce<[Goal[], Goal[]]>(
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
        [[], []] as [Goal[], Goal[]]
      );

      setActiveGoals(active);
      setArchivedGoals(archived);

      if (activeTab === 0) {
        setGoals(active);
      } else {
        setGoals(archived);
      }
    }
  }, [allGoals]);

  return (
    <GoalsMain>
      <Typography variant="h2">{t('goals')}</Typography>
      <RowInput>
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
      </RowInput>
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

