const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin')

const stats = {
  modules: false,
  children: false,
  chunks: false,
};

const appPath = filepath => path.resolve(__dirname, filepath);

module.exports = {
  entry: './src/index.js',
  output: {
    // path: appPath('../dist'),
    filename: '[name].js?v=[hash]',
    chunkFilename: '[name].chunk.js?v=[hash]',
    publicPath: '/',
    // globalObject: 'this',
  },
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    host: 'localhost',
    watchContentBase: true,
    stats,
    port: '3000',
    disableHostCheck: true,
    publicPath: '/',
    historyApiFallback: {
      disableDotRule: true,
    },
    hot: true,
  },
  resolve: {
    alias: {
      '@assets': appPath('src/assets'),
      '@common': appPath('src/common'),
    },
    extensions: ['.js', '.jsx', '.css', '.png', '.jpg', '.gif', '.jpeg', '.svg'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      chunks: ['main', 'vendors~main'],
      minify: false
        ? {
          collapseWhitespace: true,
          preserveLineBreaks: true,
          removeComments: true,
        }
        : null,
      filename: 'index.html',
      template: appPath('./public/index.html'),
      favicon: appPath('./public/favicon.ico'),
    }),
    new CopyWebpackPlugin([
      // relative path is from src
      {from: './public/manifest.json', to: './'}, // <- your path to manifest
      {from: './public/img', to: './img'}, // <- your path to manifest
    ])
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
            options: {minimize: false},
          },
        ],
      },
      {
        test: /\.(png|gif|jpe?g|webp)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: [
          'image-webpack-loader',
          {
            loader: 'file-loader',
            options: {
              name: '[hash].[ext]',
              outputPath: 'images/',
              verbose: false,
            },
          },
        ],
      },
      {
        test: /\.(scss|css)$/,
        use: [
          "style-loader", // creates style nodes from JS strings
          "css-loader", // translates CSS into CommonJS
          "sass-loader" // compiles Sass to CSS, using Node Sass by default
        ]
      },
      {
        test: /.svg$/,
        use: ['@svgr/webpack', 'url-loader'],
      }
    ],
  }
}
