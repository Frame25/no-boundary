// const ExtractTextPlugin = require('extract-text-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const autoprefixer = require('autoprefixer')
const sorting = require('postcss-sorting')

module.exports = env => {
  return {
    test: /\.(sa|sc|c)ss$/,
    use: [
      {
        loader: MiniCssExtractPlugin.loader
      },
      {
        loader: 'css-loader',
        options: {
          url: false,
          minimize: env && env === 'prod',
          sourceMap: true
        }
      },
      {
        loader: 'postcss-loader',
        options: {
          plugins: [
            require('cssnano')({
              preset: 'default'
            }),
            sorting(),
            autoprefixer({
              browsers: ['ie >= 8', 'last 4 version']
            })
          ],
          sourceMap: true
        }
      },
      { loader: 'sass-loader' }
    ]
  }
}
