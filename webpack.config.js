const webpack = require('webpack');
const copyWebpackPlugin = require('copy-webpack-plugin');
const webpackShellPlugin = require('webpack-shell-plugin');
const extractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: {
    './dist/src/windows/main/view': './src/windows/main/view.jsx',
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
    },{
      test: /\.styl$/,
      exclude: /\*.tff/,
      loader: extractTextPlugin.extract({
        fallback: { loader: 'style-loader' },
        use: [
          'css-loader',
          {
            loader: 'stylus-loader'
          }
        ]
      })
    }]
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: './dist/src/windows/vendors.js',
      minChunks: Infinity
    }),
    new extractTextPlugin('./[name].css'),
    new webpackShellPlugin({
      onBuildEnd: ['npm start']
    }),
    new copyWebpackPlugin([{
      from: './src/**/*',
      to: './dist',
      ignore: ['*.jsx', '*.styl']
    }])
  ]
}