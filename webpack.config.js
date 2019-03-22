var path = require('path');

module.exports = {
  mode: 'production',
  entry: path.join(__dirname, 'src/'),
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js'
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {loader: "babel-loader"}
      }
    ]
  },
};
