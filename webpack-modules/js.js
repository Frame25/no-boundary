module.exports = () => {
  return {
    test: /\.(js|jsx)$/,
    loader: 'babel-loader',
    exclude: /node_modules/,
    include: /src/,
    options: {
      presets: ['@babel/preset-env']
    }
  }
}
