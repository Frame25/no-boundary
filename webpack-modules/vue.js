module.exports = () => {
  return {
    test: /\.vue$/,
    use: {
      loader: 'vue-loader',
      options: {
        extractCSS: true
      }
    }
  }
}
