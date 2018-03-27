const webpack = require('webpack');
const copyWebpackPlugin = require('copy-webpack-plugin');
const webpackShellPlugin = require('webpack-shell-plugin');

if (process.env.WATCH) {}

module.exports = function (env) {
  const plugins = [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: './src/server/public/vendors.js',
      minChunks: Infinity
    }),
    new copyWebpackPlugin([{
      from: './src/client/**/*',
      to: './src/server/public',
      flatten: true,
      ignore: ['*.jsx']
    }])
  ];

  if (env) {
    plugins.push(new webpackShellPlugin({
      onBuildEnd: ['npm start']
    }));
  }

  return {
    entry: {
      index: './src/client/index.jsx',
      vendor: ['react', 'react-dom', 'prop-types', 'redux', 'react-redux', 'semantic-ui-react']
    },
    output: {
      filename: './src/server/public/[name].js'
    },
    module: {
      loaders: [{
        test: /\.jsx$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['env', 'stage-2', 'react']
        }
      }]
    },
    plugins
  }
}
