import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 15000,
    hookTimeout: 15000,
    include: ['tests/**/*.test.js'],
    // singleFork evita que el pool MySQL quede abierto entre archivos de test
    pool: 'forks',
    singleFork: true,
  },
});
