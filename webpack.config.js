const path = require('path')
const webpack = require('webpack')

module.exports = {
  entry: './src/index.js',
  output: {
    filename: '[name].js?v=[hash]',
    chunkFilename: '[name].chunk.js?v=[hash]',
    publicPath: '/',
    globalObject: 'this',
  },
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './build',
    port: 3000
  },
  resolve: {
    alias: {
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@common': path.resolve(__dirname, 'src/common'),
    },
    extensions: ['.js', '.jsx', '.css', '.png', '.jpg', '.gif', '.jpeg', '.svg'],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.(png|gif|jpe?g|svg|webp)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
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
      }
    ],
  }
}
