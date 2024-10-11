module.exports = {
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testMatch: ['**/tests/**/*.test.(ts|js)'],
  testEnvironment: 'node',

  // Add this to map the 'src/*' path alias
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  // Exclude tests in the dist folder
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
};
