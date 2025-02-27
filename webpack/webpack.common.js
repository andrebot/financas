const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { cache } = require('react');

module.exports = {
  entry: path.resolve(__dirname, '..', 'src/client/index.tsx'),
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        include: path.resolve(__dirname, '..', 'src/client'),
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/i,
        type: 'asset/resource',
      },
      // Add additional rules for other file types if needed
    ],
  },
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename],
    },
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '..', 'src/client/index.html'),
    }),
  ],
  output: {
    filename:  '[name].[contenthash].js',
    path: path.resolve(__dirname, '..', 'src/server/public'),
    clean: true,
  },
};
