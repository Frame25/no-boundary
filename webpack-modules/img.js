module.exports = () => {
  return {
    test: /\.(png|jpg|gif|svg)$/,
    loader: 'file-loader',
    options: {
      name: 'img/[name].[ext]?[hash]'
    }
  }
}
