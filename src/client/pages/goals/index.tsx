import React, { useReducer, useState, useEffect, useRef } from 'react';
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

const archivedGoals = [
  {
    id: '3',
    name: 'Goal 3',
    value: 2000,
    dueDate: new Date('2026-03-01'),
    user: '1',
    savedValue: 2000,
    progress: 100,
  },
  {
    id: '4',
    name: 'Goal 4',
    value: 2000,
    dueDate: new Date('2026-04-01'),
    user: '1',
    savedValue: 2000,
    progress: 100,
  },
];
const activeGoals = [
  {
    id: '1',
    name: 'Goal 1',
    value: 2000000000,
    dueDate: new Date('2026-01-01'),
    user: '1',
    savedValue: 900,
    progress: 90,
  },
  {
    id: '2',
    name: 'Goal 2',
    value: 2000,
    dueDate: new Date('2026-02-01'),
    user: '1',
    savedValue: 1000,
    progress: 50,
  },
];


const availableActions =  [GoalsTableActionType.EDIT, GoalsTableActionType.ARCHIVE, GoalsTableActionType.DELETE];
const archivedAvailableActions = [GoalsTableActionType.UNARCHIVE, GoalsTableActionType.DELETE];

export default function Goals(): React.JSX.Element {
  const { t } = useTranslation();
  const goalNameAnchorRef = useRef<HTMLDivElement>(null);

  const [goalState, dispatchGoal] = useReducer(goalReducer, initialGoalState);
  const [activeTab, setActiveTab] = useState(0);
  const [goals, setGoals] = useState<Goal[]>(activeGoals);
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

  const handleSaveGoal = () => {
    console.log('save goal');
    goalNameAnchorRef.current?.focus();
    dispatchGoal({ type: GoalActionType.RESET });
    enqueueSnackbar(t('goalSaved'), { variant: 'success' });
  }

  useEffect(() => {
    if (activeTab === 0) {
      setGoals(activeGoals);
      setGoalsTableActions(availableActions);
    } else {
      setGoals(archivedGoals);
      setGoalsTableActions(archivedAvailableActions);
    }
  }, [activeTab]);

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
        <Box>
          <Tabs value={activeTab} variant="fullWidth" onChange={handleTabChange}>
            <Tab label={t('active')} />
            <Tab label={t('archived')} />
          </Tabs>
        </Box>
        <GoalsTable goals={goals} availableActions={goalsTableActions} />
      </GoalsTableWrapper>
    </GoalsMain>
  );
}

