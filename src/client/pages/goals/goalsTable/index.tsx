import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import TableHead from '@mui/material/TableHead';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableSortLabel from '@mui/material/TableSortLabel';
import LinearProgress from '@mui/material/LinearProgress';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import DeselectIcon from '@mui/icons-material/Close';
import Tooltip from '@mui/material/Tooltip';
import {
  GoalsTableCell,
  GoalsTableCellAction,
  GoalsTableEmpty,
} from './styledComponents';
import { GoalsTableActionType } from '../../../enums';
import type { Goal, GoalsTableProps } from '../../../types';
import { Typography } from '@mui/material';

type SortColumn = 'value' | 'dueDate';
type SortOrder = 'asc' | 'desc';

export default function GoalsTable({
  goals,
  activeGoalId,
  availableActions,
  onArchiveGoal,
  onUnarchiveGoal,
  onDeleteGoal,
  onEditGoal,
  onDeselectGoal,
}: GoalsTableProps): React.JSX.Element {
  const { t } = useTranslation();
  const [sortBy, setSortBy] = useState<SortColumn>('dueDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const sortedGoals = useMemo(() => {
    const sorted = [...goals];
    sorted.sort((a: Goal, b: Goal) => {
      let comparison = 0;
      if (sortBy === 'value') {
        comparison = a.value - b.value;
      } else {
        comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    return sorted;
  }, [goals, sortBy, sortOrder]);

  const handleSort = (column: SortColumn) => {
    if (column === sortBy) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress === 100) {
      return 'success';
    }

    return 'primary'
  }

  const calculateGoalProgress = (savedValue: number, value: number) => {
    return (savedValue / value) * 100;
  }

  const ActionIcons = {
    [GoalsTableActionType.EDIT]: <EditIcon />,
    [GoalsTableActionType.DELETE]: <DeleteIcon color="error" />,
    [GoalsTableActionType.ARCHIVE]: <ArchiveIcon color="warning" />,
    [GoalsTableActionType.UNARCHIVE]: <UnarchiveIcon color="secondary" />,
    [GoalsTableActionType.DESELECT]: <DeselectIcon />,
  }

  const actionHanlders = {
    [GoalsTableActionType.ARCHIVE]: onArchiveGoal,
    [GoalsTableActionType.UNARCHIVE]: onUnarchiveGoal,
    [GoalsTableActionType.DELETE]: onDeleteGoal,
    [GoalsTableActionType.EDIT]: onEditGoal,
    [GoalsTableActionType.DESELECT]: onDeselectGoal,
  }

  return (
    <TableContainer>
      {goals.length > 0 ? (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('goalName')}</TableCell>
              <GoalsTableCell sortDirection={sortBy === 'value' ? sortOrder : false}>
                <TableSortLabel
                  active={sortBy === 'value'}
                  direction={sortBy === 'value' ? sortOrder : 'asc'}
                  onClick={() => handleSort('value')}
                >
                  {t('goalValue')}
                </TableSortLabel>
              </GoalsTableCell>
              <GoalsTableCell sortDirection={sortBy === 'dueDate' ? sortOrder : false}>
                <TableSortLabel
                  active={sortBy === 'dueDate'}
                  direction={sortBy === 'dueDate' ? sortOrder : 'asc'}
                  onClick={() => handleSort('dueDate')}
                >
                  {t('goalDueDate')}
                </TableSortLabel>
              </GoalsTableCell>
              <TableCell>{t('progress')}</TableCell>
              <GoalsTableCellAction>{t('actions')}</GoalsTableCellAction>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedGoals.map((goal) => (
              <TableRow key={goal.id} selected={activeGoalId === goal.id}>
                <TableCell>{goal.name}</TableCell>
                <TableCell>{goal.value}</TableCell>
                <TableCell>{dayjs(goal.dueDate).format('MM/YYYY')}</TableCell>
                <TableCell>
                  <Tooltip title={`${calculateGoalProgress(goal.savedValue, goal.value)}%`}>
                    <LinearProgress 
                      variant="determinate"
                      color={getProgressColor(goal.progress)}
                      value={goal.progress}
                    />
                  </Tooltip>
                </TableCell>
                <TableCell>
                  {availableActions
                    .filter((action) => {
                      if (action === GoalsTableActionType.EDIT && activeGoalId) return false;
                      if (action === GoalsTableActionType.DESELECT && !activeGoalId) return false;
                      return true;
                    })
                    .map((action) => (
                      <Tooltip key={action} title={t(action)}>
                        <IconButton
                          aria-label={t(action)}
                          size="large"
                          onClick={() => actionHanlders[action](goal)}
                        >
                          {ActionIcons[action]}
                        </IconButton>
                      </Tooltip>
                    ))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <GoalsTableEmpty>
          <Typography variant="body1">{t('goalsListEmpty')}</Typography>
        </GoalsTableEmpty>
      )}
    </TableContainer>
  );
}
