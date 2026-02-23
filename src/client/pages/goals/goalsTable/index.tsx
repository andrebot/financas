import React from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import TableHead from '@mui/material/TableHead';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
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
import type { GoalsTableProps } from '../../../types';
import { Typography } from '@mui/material';

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
              <GoalsTableCell>{t('goalValue')}</GoalsTableCell>
              <GoalsTableCell>{t('goalDueDate')}</GoalsTableCell>
              <TableCell>{t('progress')}</TableCell>
              <GoalsTableCellAction>{t('actions')}</GoalsTableCellAction>
            </TableRow>
          </TableHead>
          <TableBody>
            {goals.map((goal) => (
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
