
const TerserPlugin = require("terser-webpack-plugin");

module.exports = function(env) {
    const app = env.app;
    return {
        entry : './src/index.js',
        output : {
            path: __dirname + '/public/js',
            filename : 'ads-manager.js',
            library: 'weavo'
        },
        optimization: {
            minimize: app.conf === 'prod',
            minimizer: [new TerserPlugin({
                parallel: 4,
                extractComments: true,
                terserOptions: {
                    compress: {
                        drop_console: true,
                        ecma: 2015
                    }
                },
            })],
        },
    }
}
