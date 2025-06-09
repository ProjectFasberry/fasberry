const { resolve } = require('node:path');

const project = resolve(process.cwd(), 'tsconfig.json');

module.exports = {
  extends: [
    ...[
      '@vercel/style-guide/eslint/node',
      '@vercel/style-guide/eslint/typescript',
      '@vercel/style-guide/eslint/browser',
      '@vercel/style-guide/eslint/react',
      '@vercel/style-guide/eslint/next'
    ].map(require.resolve),
    "turbo",
  ],
  parserOptions: {
    project,
  },
  globals: {
    React: true,
    JSX: true,
  },
  settings: {
    'import/resolver': {
      typescript: { project },
      node: {
        extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  ignorePatterns: ['node_modules/', 'dist/'],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/consistent-type-imports': 'off',
    '@typescript-eslint/require-await': 'off',
    '@typescript-eslint/consistent-type-definitions': 'off',
    '@typescript-eslint/consistent-indexed-object-style': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    'no-console': 'off',
    'require-await': 'off',
    'no-nested-ternary': 'off',
    'no-prototype-builtins': 'off',
    'camelcase': 'off',
    'no-empty-function': 'off',
    'no-unused-vars': 'off',
    'no-promise-executor-return': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/no-default-export': 'off',
  },
};
