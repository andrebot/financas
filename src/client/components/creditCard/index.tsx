import React from 'react';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography';
import FlagIcon from '../cardFlag';
import { CardItem, CardItemSection, CardItemTopTypography } from './styledComponents';
import type { CreditCardProps } from '../../types';

/**
 * This component displays a credit card with a flag, last 4 digits, and expiration date.
 *
 * @param flag - The flag of the credit card
 * @param last4Digits - The last 4 digits of the credit card
 * @param expirationDate - The expiration date of the credit card
 * @returns The credit card component
 */
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
