module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],
  testMatch: ['<rootDir>/tests/client/**/*.spec.tsx', '<rootDir>/tests/client/**/*.spec.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest']
  },
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.js'],
  collectCoverageFrom: [
    '<rootDir>/src/client/**/*.tsx',
    '<rootDir>/src/client/**/*.ts',
    '!<rootDir>/src/client/**/*.d.ts',
    '!<rootDir>/src/client/**/styledComponent.tsx',
    '!<rootDir>/src/client/**/styledComponents.tsx',
    '!<rootDir>/src/client/config/*.tsx',
    '!<rootDir>/src/client/i18n/index.tsx',
    '!<rootDir>/src/client/types/*.tsx',
    '!<rootDir>/src/client/index.tsx',
    '!<rootDir>/src/client/routes/index.tsx',
  ],
  coverageDirectory: 'client-cov',
  coverageReporters: ['html', 'text-summary'],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/tests/client/assetsMocks/fileMock.js',
  },
};
