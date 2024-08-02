import tseslint from 'typescript-eslint'


export default [
  {
    files: ['src/**/*.{js,mjs,cjs,ts}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      'no-unused-private-class-members': 'error',
      'quotes': [
        'error',
        'single'
      ]
    }
  },
  ...tseslint.configs.recommended,
];