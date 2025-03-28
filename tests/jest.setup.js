require('@testing-library/jest-dom');
const { TextEncoder, TextDecoder } = require('util');
require('whatwg-fetch');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
