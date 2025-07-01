const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const DotenvWebpackPlugin = require('dotenv-webpack');
const webpack = require('webpack');

module.exports = {
  entry: './frontend/src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'frontend/src'),
      '@types': path.resolve(__dirname, 'types'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: 'ts-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new DotenvWebpackPlugin({
      systemvars: true,
    }),
    new webpack.DefinePlugin({
      'process.env.REACT_APP_API_BASE_URL': JSON.stringify(process.env.REACT_APP_API_BASE_URL || '/api'),
    }),
  ],
  devServer: {
    historyApiFallback: true,
    port: 3000,
    hot: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        secure: false,
        changeOrigin: true,
      },
    },
  },
};