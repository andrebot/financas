const webpack = require('webpack');
const copyWebpackPlugin = require('copy-webpack-plugin');
const webpackShellPlugin = require('webpack-shell-plugin');

if (process.env.WATCH) {}

module.exports = function (env) {
  const plugins = [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: './dist/src/windows/vendors.js',
      minChunks: Infinity
    }),
    new copyWebpackPlugin([{
      from: './src/**/*',
      to: './dist',
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
      './dist/src/windows/main/view': './src/windows/main/view.jsx',
      './dist/src/windows/createBank/view': './src/windows/createBank/view.jsx',
      vendor: ['react', 'react-dom', 'prop-types', 'redux', 'react-redux']
    },
    output: {
      filename: '[name].js'
    },
    module: {
      loaders: [{
        test: /\.jsx$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['react']
        }
      }]
    },
    plugins
  }
}
