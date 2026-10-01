import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  {
    // Vendored chart library and shadcn primitives export hooks and variant
    // helpers next to their components by design. Splitting them would fork
    // upstream for a dev-only cost: these files full-reload instead of HMR.
    files: ['src/components/charts/**', 'src/components/ui/**'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
])
