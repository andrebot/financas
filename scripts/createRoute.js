// createRoute.js
const fs = require('fs');
const path = require('path');

const fileName = process.argv[2];

if (!fileName) {
  console.error('Please provide a file name.');
  process.exit(1);
}

const content = `
import express from 'express';

const router = express.Router();

// Define your routes here

export default {
  urlPrefix: '${fileName}',
  router,
};
`;

// Adjust the path to point to the correct directory
const filePath = path.join(__dirname, `../src/server/routes/${fileName}.ts`);

// Check if the directory exists, if not, create it
const directoryPath = path.dirname(filePath);
if (!fs.existsSync(directoryPath)) {
  fs.mkdirSync(directoryPath, { recursive: true });
}

fs.writeFile(filePath, content.trim(), (err) => {
  if (err) {
    console.error('Error writing file:', err);
    return;
  }
  console.log(`File ${fileName}.ts created successfully in src/server/routes`);
});
