module.exports = () => {
  return {
    test: /\.(woff|woff2|eot|ttf)$/,
    use: [
      {
        loader: 'file-loader',
        options: {
          // limit: '10000',
          name: '[name].[ext]',
          outputPath: 'fonts/',
          publicPath: '../fonts/'
        }
      }
    ]
  }
}
