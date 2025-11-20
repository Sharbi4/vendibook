module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2022: true
  },
  settings: {
    react: { version: 'detect' }
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true }
  },
  ignorePatterns: ['dist/', 'build/', '.vercel/', 'node_modules/', 'prisma/'],
  plugins: ['react', 'react-hooks', 'react-refresh'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }]
  }
};