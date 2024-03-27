// module.exports = {
//     // Specify the test environment
//     testEnvironment: "node",
  
//     // Specify the directories where Jest should look for tests
//     roots: ["<rootDir>/tests/"],
  
//     // Specify the file patterns Jest should use to find test files
//     testMatch: ["**/*.test.ts"],
  
//     // Add any other Jest configurations as needed
//   };
  
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    "transform": {
        "^.+\\.tsx?$": "ts-jest"
      },
    moduleNameMapper: {
      '^@aptos-labs/ts-sdk$': '../tests/mock-ts-sdk.js', // Mock @aptos-labs/ts-sdk module if needed
    },
    // If you are using TypeScript with ES module syntax
    extensionsToTreatAsEsm: ['.ts'],
    globals: {
      'ts-jest': {
        useESM: true,
      },
    },
  };
  