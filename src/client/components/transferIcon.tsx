import React from 'react';
import SvgIcon from '@mui/material/SvgIcon';
import type { TransferIconProps } from '../types';

export default function TransferIcon({
  direction = 'both',
  ...props
}: TransferIconProps) {
  const upColor =
    direction === 'out' || direction === 'both'
      ? 'red'
      : 'currentColor';

  const downColor =
    direction === 'in' || direction === 'both'
      ? 'green'
      : 'currentColor';

  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path
        d="M9 3 5 6.99h3V14h2V6.99h3z"
        fill={upColor}
      />
      <path
        d="M16 17.01V10h-2v7.01h-3L15 21l4-3.99z"
        fill={downColor}
      />
    </SvgIcon>
  );
}
