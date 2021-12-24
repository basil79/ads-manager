module.exports = {
    env: {
        browser: true,
        es6: true,
        node: true
    },
    extends: 'eslint:recommended',
    parser: 'babel-eslint',
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module'
    },
    plugins: ['import'],
    rules: {
        quotes: ['warn', 'single'],
        eqeqeq: 'off',
        'no-console': 'error'
    }
};
