const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const { name, version } = require('./package.json');

module.exports = function(env, args) {

  let plugins = args.mode === 'production' ? [] : [new webpack.BannerPlugin({
    banner: `${name} v${version} ${args.mode}\nUpdated : ${(new Date()).toISOString().substring(0, 10)}`
  })]

  const optimization = {
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
  };

  let targets = [{
    entry : './src/index.js',
    output : {
      path: __dirname + (args.mode === 'production' ? '/dist' : '/public/js'),
      filename : 'ads-manager.js',
      library: 'ssp4'
    },
    plugins: plugins,
    optimization: optimization
  }];

  // Append NODE target for production
  if(args.mode === 'production') {
    targets.push({
      target: 'node',
      entry : './src/ads-manager.js',
      output: {
        path: __dirname + '/dist',
        filename : 'ads-manager.node.js',
      },
      optimization: optimization
    })
  }

  return targets;


  /*
  return [{
    target: 'web',
    entry : './src/index.js',
    output : {
      path: __dirname + (args.mode === 'production' ? '/dist' : '/public/js'),
      filename : 'ads-manager.js',
      library: 'ssp4'
    },
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
  }, {
    target: 'node',
    entry : './src/ads-manager.js',
    output: {
      path: __dirname + '/dist',
      filename : 'ads-manager.node.js',
    },
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
  }]*/
}
