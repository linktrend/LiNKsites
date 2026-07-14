import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  // Scope path-alias discovery to a dedicated tsconfig.vitest.json (GAP-43).
  // Without an explicit `projects` list, vite-tsconfig-paths walks the whole
  // pnpm workspace and "eagerly" loads every tsconfig it finds (including
  // the now-archived old_linktrend app's legacy, unrelated tsconfig), and can pick
  // the wrong project's "@/*" mapping for files it doesn't recognize.
  // apps/cms/tsconfig.json itself intentionally excludes `tests/` from its
  // `include` globs (keeping test files out of the app's own production
  // type-check surface), so it doesn't match test files either. tsconfig.
  // vitest.json extends the app config but includes `tests/**` too, giving
  // vitest a correct, narrowly-scoped resolution context without changing
  // the main tsconfig's exclusions.
  plugins: [tsconfigPaths({ projects: ['./tsconfig.vitest.json'] }), react()],
  test: {
    environment: 'jsdom',
    // jsdom's window.localStorage only initializes fully for a real HTTP(S)
    // origin -- without this, `window.localStorage.clear` etc. are missing
    // (GAP-43 follow-up, discovered while fixing the "@/..." import
    // resolution issue).
    environmentOptions: {
      jsdom: {
        url: 'http://localhost/',
      },
    },
    setupFiles: ['./vitest.setup.ts'],
    include: [
      'tests/int/**/*.int.spec.ts',
      'tests/int/**/*.int.spec.tsx',
      'tests/contracts/**/*.spec.ts',
    ],
    environmentMatchGlobs: [
      ['tests/contracts/**', 'node'],
    ],
  },
})
