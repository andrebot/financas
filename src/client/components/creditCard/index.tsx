import React from 'react';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography';
import FlagIcon from '../cardFlag';
import { CardItem, CardItemSection, CardItemTopTypography } from './styledComponents';
import type { CreditCardProps } from '../../types';

export default function CreditCard({ flag, last4Digits, expirationDate }: CreditCardProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <CardItem>
      <CardItemSection>
        <CardItemTopTypography>{t('credit')}</CardItemTopTypography>
        <FlagIcon flag={flag} />
      </CardItemSection>
      <Typography variant="subtitle1">**** **** **** {last4Digits}</Typography>
      <CardItemSection>
        <CardItemTopTypography variant="subtitle1">{t('expires')}</CardItemTopTypography>
        <Typography variant="subtitle1">{expirationDate}</Typography>
      </CardItemSection>
    </CardItem>
  );
}
