import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@kt/core': path.resolve(__dirname, 'packages/core/src/index.ts'),
      '@kt/bots': path.resolve(__dirname, 'apps/bots/src/index.ts'),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    pool: 'forks',
  },
});
