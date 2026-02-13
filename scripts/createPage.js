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

function toKebabCase(string) {
  return string.toLowerCase().replace(/ /g, '-');
}

const componentContent = `import React from 'react';
import { useTranslation } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';
import { useNavigate } from 'react-router';
import { } from './styledComponents';

export default function ${capitalize(pageName)}(): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <div>
      <h1>${pageName}</h1>
    </div>
  );
}

`;

const styledComponentsContent = `import { styled } from '@mui/material/styles';
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

const routesFilePath = path.join(__dirname, `../src/client/routes/index.tsx`);
const routesContent = fs.readFileSync(routesFilePath, 'utf8');
const lines = routesContent.split('\n');
let lastImportLineIndex = -1;

for (let i = 0; i < lines.length; i++) {
  if (/^import\s/.test(lines[i].trimStart())) {
    lastImportLineIndex = i;
  }
}

if (lastImportLineIndex === -1) {
  console.error('Could not find any import in routes file.');
  process.exit(1);
}

const newImport = `import ${capitalize(pageName)} from '../pages/${pageName}';`;
lines.splice(lastImportLineIndex + 1, 0, newImport);
const newRoutesContent = lines.join('\n');
fs.writeFileSync(routesFilePath, newRoutesContent);
