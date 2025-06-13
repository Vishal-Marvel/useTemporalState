module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom', // this now uses the installed jest-environment-jsdom
  testMatch: ['**/tests/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};
