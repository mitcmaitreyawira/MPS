// Jest setup file for proper type definitions
import 'jest';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to silence console output during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};