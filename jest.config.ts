export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^~/(.*)$': '<rootDir>/src/$1',
    },
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coveragePathIgnorePatterns: ['/node_modules/'],
};