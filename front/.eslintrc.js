module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: ['airbnb', 'prettier'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: ['react', 'prettier'],
  rules: {
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
    semi: [2, 'never'],
    'react/jsx-one-expression-per-line': 'off',
    'import/prefer-default-export': 'off',
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
  },
  overrides: [
    {
      files: ['**/*.test.js'],
      env: {
        jest: true,
      },
    },
  ],
}
