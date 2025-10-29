const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { cache } = require('react');

module.exports = {
  entry: path.resolve(__dirname, '..', 'src/client/index.tsx'),
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        include: path.resolve(__dirname, '..', 'src/client'),
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
                '@babel/preset-react',
                '@babel/preset-typescript',
              ],
              plugins: [
                process.env.NODE_ENV === 'development' && 'react-refresh/babel',
              ].filter(Boolean),
            },
          },
        ],
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.svg$/i,
        use: ['@svgr/webpack', 'url-loader'],
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
