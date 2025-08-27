module.exports = {
  root: true,
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
    ecmaVersion: 2020,
    ecmaFeatures: {
      jsx: true
    },
    project: null,
    tsconfigRootDir: __dirname,
    extraFileExtensions: ['.vue']
  },
  // ... 其他配置保持不变
}; 