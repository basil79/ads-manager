const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const { name, version } = require('./package.json');

module.exports = function(env, args) {

  let plugins = args.mode === 'production' ? [] : [new webpack.BannerPlugin({
    banner: `${name} v${version} ${args.mode}\nUpdated : ${(new Date()).toISOString().substring(0, 10)}`
  })];

  return {
    entry : './src/index.js',
    output : {
      path: __dirname + (args.mode === 'production' ? '/dist' : '/public/js'),
      filename : 'ads-manager.js',
      library: 'ssp4'
    },
    plugins: plugins,
    optimization: {
      minimize: args.mode === 'production',
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
    module: {
      rules: [{
        test: /\.js$/,
        loader: 'string-replace-loader',
        options: {
          multiple: [{
            search: '!!#Version#!!',
            replace: `${version}`
          }]
        }
      }]
    }
  }
}
