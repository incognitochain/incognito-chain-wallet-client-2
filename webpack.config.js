const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const appPath = filepath => path.resolve(__dirname, filepath);

const optimization = {
  minimize: true,
  minimizer: [
    new TerserPlugin({
      terserOptions: {
        warnings: false,
        compress: {
          comparisons: false,
          drop_console: true,
        },
        parse: {},
        mangle: true,
        output: {
          comments: false,
          ascii_only: true,
        },
      },
      parallel: true,
      cache: true,
      sourceMap: false,
    }),
  ],
  nodeEnv: 'production',
  sideEffects: true,
  concatenateModules: true,
  runtimeChunk: 'single',
  splitChunks: {
    chunks: 'all',
    maxInitialRequests: Infinity,
    minSize: 30000,
    maxSize: 0,
    cacheGroups: {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        // name(module) {
        //   console.log('====', module);
        //   // get the name. E.g. node_modules/packageName/not/this/part.js
        //   // or node_modules/packageName
        //   const packageName = module.context.match(
        //     /[\\/]node_modules[\\/](.*?)([\\/]|$)/,
        //   )[1];

        //   // npm package names are URL-safe, but some servers don't like @ symbols
        //   return `npm.${packageName.replace('@', '')}`;
        // },
        chunks: 'all'
      },
    },
  },
};

const devConfig = {
  mode: 'development',
  devServer: {
    host: '0.0.0.0',
    watchContentBase: true,
    stats: {
      modules: false,
      children: false,
      chunks: false,
    },
    port: '3000',
    disableHostCheck: true,
    publicPath: '/',
    historyApiFallback: {
      disableDotRule: true,
    },
    hot: true,
  },
};

const prodConfig = {
  mode: 'production',
  optimization
};

module.exports = (env, argv) => {
  const isProduction = (argv.mode === 'production');
  const isAnalyzer = env && env.analyzer;
  console.log("build mode:", argv.mode)
  const appEnv = require('./.env.' + argv.mode + '.js');

  return {
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist/'),
      filename: '[name].js?v=[hash]',
      chunkFilename: '[name].chunk.js?v=[hash]',
      publicPath: '/',
    },
    devtool: 'inline-source-map',
    resolve: {
      alias: {
        '@assets': appPath('src/assets'),
        '@common': appPath('src/common'),
        '@src': appPath('src'),
      },
      extensions: ['.js', '.jsx', '.css', '.png', '.jpg', '.gif', '.jpeg', '.svg'],
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': JSON.stringify({
          ...appEnv,
          isProduction,
          NODE_ENV: argv.mode,
          DEBUG: !isProduction,
        }),
      }),
      new HtmlWebpackPlugin({
        minify: isProduction
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
        {from: './public/img', to: './img'},
        {from: './src/assets/privacy.wasm', to: './'},
      ]),
      ...isProduction ? [new CleanWebpackPlugin()] : [],
      ...(isAnalyzer ? [new BundleAnalyzerPlugin()] : []),
    ],
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: [/node_modules/],
          use: 'babel-loader'
        },
        {
          test: /\.html$/,
          use: [
            {
              loader: 'html-loader',
              options: {minimize: isProduction},
            },
          ],
        },
        {
          test: /\.(png|gif|jpe?g|webp|wasm)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
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
    },
    ...isProduction ? prodConfig : devConfig
  }
}
