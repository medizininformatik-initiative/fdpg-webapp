import { fileURLToPath } from 'node:url'
import { mergeConfig } from 'vite'
import { configDefaults, defineConfig } from 'vitest/config'
import viteConfig from './vite.config.app'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/*'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      transformMode: {
        web: [/\.[jt]sx$/],
      },
      deps: {
        inline: ['element-plus'],
      },
      setupFiles: ['./src/__test__/setup-tests.ts'],
      reporters: ['default', 'junit'],
      outputFile: './reports/junit.xml',
      coverage: {
        all: true,
        reportsDirectory: './reports/coverage',
        reporter: ['text', 'json', 'html', 'cobertura', 'lcov'],
        include: ['src/**/*.{js,jsx,ts,tsx,vue}'],
        exclude: [
          'src/**/*.d.ts',
          '**/__mocks__/**',
          '**/__tests__/**',
          '**/__test__/**',
          '**/*.spec.ts',
          '**/*.mock.ts',
          'src/main.ts',
          'src/locales/**',
          'src/router/routes.ts',
          'src/router/index.ts',
          // Libs where we assume that they are tested by the maintainer
          'src/libs/**',
        ],
      },
    },
  }),
)
