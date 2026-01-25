const path = require('path');

module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@/(.*)$': path.resolve(__dirname, '../backend/src/$1'),
    },
    transform: {
        '^.+\\.(t|j)sx?$': ['ts-jest', {
            tsconfig: path.resolve(__dirname, '../backend/tsconfig.json'),
        }],
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    setupFiles: [path.resolve(__dirname, './jest.setup.js')],
    testMatch: ['**/*.test.js'],
};
