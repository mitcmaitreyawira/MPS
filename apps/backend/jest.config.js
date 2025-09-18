module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\.spec\.ts$',
  transform: {
    '^.+\.(t|j)s$': ['ts-jest', {
      tsconfig: 'tsconfig.spec.json'
    }],
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
  ],
  coverageDirectory: '../coverage',
  setupFilesAfterEnv: ['<rootDir>/test-setup.ts'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/$1',
  }
};