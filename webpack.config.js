const {
  version = '1.2.0',
  path = require('path'),
  HtmlPlugin = require('html-webpack-plugin'),
  MiniCssExtractPlugin = require('mini-css-extract-plugin')
} = {}

const {
  jsConfig = require('./webpack-modules/js.js'),
  stylesConfig = require('./webpack-modules/styles.js'),
  vueConfig = require('./webpack-modules/vue.js'),
  imgConfig = require('./webpack-modules/img.js'),
  fontsConfig = require('./webpack-modules/fonts.js'),
  CopyWebpackPlugin = require('copy-webpack-plugin')
} = {}

const jsBundle = {
  entry: {
    index: './src/pages/index/index.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].js?' + version
  }
}

const extractCss = new MiniCssExtractPlugin({
  filename: 'css/[name].css?' + version
})

const configs = {
  module: {
    rules: [ jsConfig(), stylesConfig(), vueConfig(), fontsConfig(), imgConfig() ]
  }
}

const plugins = {
  plugins: [
    new HtmlPlugin({
      title: 'index',
      filename: 'index.html',
      template: './src/pages/index/index.html',
      chunks: ['index']
    }),
    extractCss,
    new CopyWebpackPlugin([
      {
        from: path.join(__dirname, 'static/**/*'),
        to: 'dist'
      }
    ])
  ]
}

const common = {
  ...jsBundle,
  ...configs,
  ...plugins
}

const dev = {
  mode: 'development',
  ...common,
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: false,
    https: true,
    port: 9000,
    proxy: {
      '/posts': 'http://localhost:3000',
      '/countries': 'http://localhost:3000'
    }
  }
}

module.exports = env => {
  if (env === 'prod') {
    return common
  } else if (env === 'dev') {
    return dev
  } else {
    return dev
  }
}
