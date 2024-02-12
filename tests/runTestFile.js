require('ts-node').register({
  // Specify options here if needed
});

const Mocha = require('mocha');
const path = require('path');
const chokidar = require('chokidar');

// The test file is passed as the first argument to the script
const testFilePath = process.argv[2];

if (!testFilePath) {
  console.error('Please specify a test file path.');
  process.exit(1);
}

// Function to run the test
const runTest = () => {
  // Clear require cache to ensure test files are reloaded on each run
  Object.keys(require.cache).forEach(function(key) {
    delete require.cache[key];
  });

  // Instantiate a Mocha instance.
  const mocha = new Mocha({
    timeout: 10000,
    reporter: 'spec',
    // Remove the require option if ts-node is registered globally
  });

  mocha.addFile(path.resolve('tests/server/testSetup.ts'));
  mocha.addFile(path.resolve(testFilePath));

  // Run the tests.
  mocha.run((failures) => {
    process.exitCode = failures ? 1 : 0;
  }).on('end', () => {
    console.log('Waiting for file changes...');
  });
};

// Initial test run
runTest();

// Watch the specified test file and re-run tests on change
chokidar.watch(path.resolve(testFilePath)).on('change', () => {
  console.clear();
  console.log('File changed, re-running tests...');
  runTest();
});


// const Mocha = require('mocha');
// const path = require('path');
// const chokidar = require('chokidar');

// // The test file is passed as the first argument to the script
// const testFilePath = process.argv[2];

// if (!testFilePath) {
//   console.error('Please specify a test file path.');
//   process.exit(1);
// }

// // Function to run the test
// const runTest = () => {
//   // Instantiate a Mocha instance.
//   const mocha = new Mocha({
//     timeout: 10000,
//     reporter: 'spec',
//     require: ['ts-node/register'], // Required for TypeScript tests
//   });

//   mocha.addFile(path.resolve(testFilePath));

//   // Run the tests.
//   mocha.run((failures) => {
//     process.exitCode = failures ? 1 : 0; // exit with non-zero status if there were failures
//   }).on('end', () => {
//     // Important: This is necessary to force Mocha to exit the Node.js process
//     // in watch mode, allowing it to re-run tests on file change.
//     process.exit();
//   });
// };

// // Initial test run
// runTest();

// // Watch the specified test file and re-run tests on change
// chokidar.watch(path.resolve(testFilePath)).on('change', () => {
//   console.clear();
//   console.log('File changed, re-running tests...');
//   runTest();
// });
