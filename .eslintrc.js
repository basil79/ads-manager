module.exports = {
    env: {
        browser: true,
        es6: true,
        node: true
    },
    extends: 'eslint:recommended',
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module'
    },
    plugins: ['import'],
    rules: {
        quotes: ['error', 'single'],
      semi: 'off',
        eqeqeq: 'off',
        'no-console': 'error'
    }
};
