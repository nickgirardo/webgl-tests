module.exports = {
  entry: './src/app.js',
  mode: 'development',
  devtool: 'source-map',
  output: {
    path: __dirname + '/build',
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        // TODO this collada loader is a bit barebones
        // might want to replace or put another loader after
        // it to get the indices in the format webgl wants
        test: /\.dae$/,
        loader: 'dae-loader',
      },
      {
        test: /\.obj$/,
        loader: 'webpack-obj-loader',
      },
      {
        test: /\.png$/,
        loader: 'base64-inline-loader?name=[name].[ext]',
      },
      {
        test: /\.frag$/,
        loader: 'raw-loader',
      },
      {
        test: /\.vert$/,
        loader: 'raw-loader',
      },
    ],
  },
}
