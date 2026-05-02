import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import pluginCypress from 'eslint-plugin-cypress'
import pluginVitest from '@vitest/eslint-plugin'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default defineConfig([
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,js,mjs,jsx}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },

  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],

  {
    ...pluginCypress.configs.recommended,
    files: [
      'cypress/e2e/**/*.{cy,spec}.{js,ts,jsx,tsx}',
      'cypress/support/**/*.{js,ts,jsx,tsx}',
    ],
  },

  // Visual-audit and layout E2E tests legitimately need brief settle
  // delays before screenshots and intentionally chain DOM commands for
  // readability. The cypress style rules are explicitly allowlisted here
  // so lint output stays actionable.
  {
    name: 'cypress/visual-audit-style-overrides',
    files: [
      'cypress/e2e/action-row-layout.cy.js',
      'cypress/e2e/list-workspace-visual-audit.cy.js',
      'cypress/e2e/page-header-visual-audit.cy.js',
      'cypress/e2e/visual-audit.cy.js',
    ],
    rules: {
      'cypress/no-unnecessary-waiting': 'off',
      'cypress/unsafe-to-chain-command': 'off',
    },
  },

  // Allow an underscore-prefix to mark intentionally-unused parameters
  // (kept for signature parity with other audit helpers).
  {
    name: 'cypress/allow-underscore-unused-args',
    files: ['cypress/**/*.{js,ts,jsx,tsx}'],
    rules: {
      'no-unused-vars': [
        'error',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },

  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/*.test.js', 'src/**/__tests__/**/*.{js,ts,jsx,tsx}'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.vitest,
      },
    },
  },

  skipFormatting,
])
