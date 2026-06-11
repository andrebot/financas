import React, { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { DashboardHeaderWrapper, YearCarousel, YearLabel } from './styledComponents';

const MONTHS = Array.from({ length: 12 }, (_, i) => dayjs().month(i).format('MMM'));

export type DashboardHeaderProps = {
  selectedYear: number;
  selectedMonth: number;
  oldestYear: number;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
};

/**
 * Dashboard header with a year carousel and a month tab bar.
 * Controlled component — the parent owns year/month state and passes it down
 * so sibling widgets can react to the selection.
 *
 * @param props - {@link DashboardHeaderProps}
 */
export default function DashboardHeader({
  selectedYear,
  selectedMonth,
  oldestYear,
  onYearChange,
  onMonthChange,
}: DashboardHeaderProps) {
  const currentYear = dayjs().year();
  const [yearMenuAnchor, setYearMenuAnchor] = useState<HTMLElement | null>(null);

  const yearOptions = useMemo(() => {
    return Array.from({ length: currentYear - oldestYear + 1 }, (_, i) => currentYear - i);
  }, [currentYear, oldestYear]);

  function handleYearLabelClick(evt: React.MouseEvent<HTMLElement>) {
    setYearMenuAnchor(evt.currentTarget);
  }

  function handleYearMenuClose() {
    setYearMenuAnchor(null);
  }

  function handleYearSelect(year: number) {
    onYearChange(year);
    setYearMenuAnchor(null);
  }

  return (
    <DashboardHeaderWrapper>
      <YearCarousel>
        <IconButton
          size="small"
          disabled={selectedYear <= oldestYear}
          onClick={() => onYearChange(selectedYear - 1)}
        >
          <ChevronLeftIcon />
        </IconButton>
        <YearLabel onClick={handleYearLabelClick}>{selectedYear}</YearLabel>
        <IconButton
          size="small"
          disabled={selectedYear >= currentYear}
          onClick={() => onYearChange(selectedYear + 1)}
        >
          <ChevronRightIcon />
        </IconButton>
        <Menu
          anchorEl={yearMenuAnchor}
          open={Boolean(yearMenuAnchor)}
          onClose={handleYearMenuClose}
        >
          {yearOptions.map((year) => (
            <MenuItem
              key={year}
              selected={year === selectedYear}
              onClick={() => handleYearSelect(year)}
            >
              {year}
            </MenuItem>
          ))}
        </Menu>
      </YearCarousel>
      <Tabs
        value={selectedMonth}
        onChange={(_, month: number) => onMonthChange(month)}
        variant="scrollable"
        scrollButtons="auto"
      >
        {MONTHS.map((month, i) => (
          <Tab key={month} label={month} value={i} />
        ))}
      </Tabs>
    </DashboardHeaderWrapper>
  );
}
