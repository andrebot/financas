// components/FlagIcon.tsx
import React from 'react';
import SvgIcon from '@mui/material/SvgIcon';
import { ReactComponent as AmazonCC } from '../../assets/amazonCC.svg';
import { ReactComponent as MastercardCC } from '../../assets/masterCC.svg';
import { ReactComponent as VisaCC } from '../../assets/visaCC.svg';
import { ReactComponent as AmexCC } from '../../assets/amexCC.svg';
import { ReactComponent as DinersCC } from '../../assets/dinersCC.svg';
import { ReactComponent as DiscoverCC } from '../../assets/discoverCC.svg';
import { ReactComponent as MaestroCC } from '../../assets/maestroCC.svg';
import type { Flag, FlagIconProps } from '../../types';

const ICONS: Record<Flag, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  amazon: AmazonCC,
  master: MastercardCC,
  visa: VisaCC,
  amex: AmexCC,
  diners: DinersCC,
  discover: DiscoverCC,
  maestro: MaestroCC,
  unknown: () => null,
};

export default function FlagIcon({ flag, ...props }: FlagIconProps) {
  const flagIcon = ICONS[flag];
  return <SvgIcon component={flagIcon} viewBox="0 0 32 32" {...props} />;
}
