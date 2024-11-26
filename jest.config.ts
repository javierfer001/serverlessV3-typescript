import type { JestConfigWithTsJest } from 'ts-jest'

const jestConfig: JestConfigWithTsJest = {
  preset: "ts-jest",
  testEnvironment: "node",
  testTimeout: 100000,
  setupFiles: ["<rootDir>/.jest/env.js"],
  collectCoverageFrom: [
    "src/**/*.{ts,js}",
    "!**/.esbuild/**/*.{ts,js}",
    "!**/.serverless/**/*.{ts,js}",
    "!src/**/migrations/**/*.{ts,js}",
  ],
  moduleNameMapper: {
    "^src/(.*)$": "<rootDir>/src/$1",
    "^tests/(.*)$": "<rootDir>/tests/$1",
    "#node-web-compat": "./node-web-compat-node.js"
  },
  testPathIgnorePatterns: ["node_modules"]
}
export default jestConfig
