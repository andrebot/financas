import React from 'react';
import { Icon } from 'semantic-ui-react';

export function formatDate (value) {
  if (!value) {
    return '';
  }

  if (!(value instanceof Date)) {
    throw new Error(`FormatHelpers.jsx: Trying to parse Date with some invalid value: ${value}`);
  }

  let day = value.getDate();
  let month = value.getMonth() + 1;

  if (day < 10) {
    day = `0${day}`;
  }

  if (month < 10) {
    month = `0${month}`;
  }

  return `${day}/${month}/${value.getFullYear()}`;
};

export function formatCurrency (value) {
  return `R$ ${value.toFixed(2)}`;
}

export const formatValue = ({ value, type }, transform = function (toParse) { return toParse }) => {
  if (value == null) {
    return '';
  }

  switch(type) {
    case 'Date':
      return formatDate(transform(value));
    case 'Currency':
      return formatCurrency(transform(value));
    case 'Boolean':
      if (transform(value)) {
        return <Icon color='green' name='checkmark' size='large' />
      } else {
        return <Icon color='red' name='x' size='large' />
      }
    default:
      return transform(value);
  }
};
