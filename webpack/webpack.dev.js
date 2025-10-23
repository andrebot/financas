const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'source-map',
  output: {
    filename: '[name].js', // Remove contenthash for dev
  },
  devServer: {
    static: {
      directory: path.join(__dirname, '..', 'src/server/public'),
    },
    devMiddleware: {
      writeToDisk: true,
    },
    hot: true,
    port: 3001,
    open: false,
    historyApiFallback: true,
    compress: true,
    proxy: [
      {
        context: ['/api'],
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    ],
  },
  plugins: [
    new ReactRefreshWebpackPlugin(),
  ],
});
