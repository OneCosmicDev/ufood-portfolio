/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'jsdom',
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    setupFilesAfterEnv: ['<rootDir>/src/app/tests/utils/setupTests.ts'],
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/src/app/tests/utils/__mocks__/fileMock.cjs',
    },
    testPathIgnorePatterns: ['<rootDir>/src/app/tests/utils/'],
    testMatch: [
        '<rootDir>/src/**/*.test.+(ts|tsx|js)',
        '<rootDir>/src/app/tests/**/*.+(ts|tsx|js)'
    ],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    transform: {
        '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: 'tsconfig.json', useESM: true }],
        '^.+\\.jsx?$': 'babel-jest',
    },
    transformIgnorePatterns: [
        'node_modules/(?!@tsparticles|framer-motion|@tsparticles/plugin-absorbers|tsparticles)'
    ],
};
