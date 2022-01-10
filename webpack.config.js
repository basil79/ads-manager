
const TerserPlugin = require('terser-webpack-plugin');

module.exports = function(env) {
  const app = env.app;
  return {
    entry : './src/index.js',
    output : {
      path: __dirname + (app.conf === 'prod' ? '/dist' : '/public/js'),
      filename : 'ads-manager.js',
      library: 'ssp4'
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
