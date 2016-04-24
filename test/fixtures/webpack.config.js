module.exports = {
  entry: __dirname + '/index.js',
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel'
      },
    ]
  },
  output: {
    path: __dirname,
    filename: 'bundle.js'
  }
};
