module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/frontend/src'],
  setupFiles: ['<rootDir>/test/jest.env.ts'],
  moduleNameMapper: {
    // Keep asset mappers before the @ alias. Jest stops at the first match,
    // so an aliased CSS import would otherwise resolve to the real stylesheet.
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/frontend/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/frontend/src/setupTests.ts'],
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
