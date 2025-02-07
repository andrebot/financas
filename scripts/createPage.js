const fs = require('fs');
const path = require('path');

const pageName = process.argv[2];

if (!pageName) {
  console.error('Please provide a file name.');
  process.exit(1);
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const componentContent = `
import React from 'react';
import { useTranslation } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { } from './styledComponents';

export default function ${capitalize(pageName)}(): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <div>
      <h1>${pageName}</h1>
    </div>
  );
};`;

const styledComponentsContent = `
import { styled } from '@mui/material/styles';
import type { StyleCompProp } from '../../types';

`;

const folderPath = path.join(__dirname, `../src/client/pages/${pageName}`);

if (!fs.existsSync(folderPath)) {
  fs.mkdirSync(folderPath, { recursive: true });
}

const componentFilePath = path.join(folderPath, `index.tsx`);
const styledComponentsFilePath = path.join(folderPath, 'styledComponents.ts');

fs.writeFileSync(componentFilePath, componentContent);
fs.writeFileSync(styledComponentsFilePath, styledComponentsContent);
