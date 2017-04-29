const path = require('path');
const autoprefixer = require('autoprefixer');
const flexfixes = require('postcss-flexbugs-fixes');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const merge = require('webpack-merge');

const env = process.env.npm_lifecycle_event === 'build' ? 'prod' : 'dev';
let config = {};

// config that is shared between all types of build (dev and prod)
const common = {
  entry: ['babel-polyfill', './src/index.jsx'],

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },

  module: {
    rules: [
      {
        enforce: 'pre', // lint files before they are transformed, config in .eslintrc.json
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader' // config in .babelrc
      },
      {
        test: /\.(png|svg|jpg|gif|woff|woff2|eot|ttf)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        exclude: /node_modules/,
        loader: 'url-loader?limit=10000' // will insert a data URI if filesize < 10kb otherwise uses file-loader
      }
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      hash: true
    })
  ],

  resolve: {
    extensions: ['.js', '.jsx', '.json', '.scss'],
    modules: [path.resolve(__dirname, 'src'), 'node_modules']
  }
};

// environment specific config
switch (env) {
  case 'dev':
    config = merge(common, {
      devtool: 'cheap-module-eval-source-map',

      devServer: {
        historyApiFallback: true // enables reloads of routed pages
      },

      // because we need to use ExtractTextPlugin for prod, we have to specify the 'dev' scss test here
      // rather than in common, or else they get merged weirdly
      module: {
        rules: [
          {
            test: /\.scss$/,
            exclude: /node_modules/,
            use: [
              'style-loader',
              'css-loader',
              {
                loader: 'postcss-loader',
                options: {
                  plugins: [
                    autoprefixer({browsers: ['last 2 versions']}),
                    flexfixes()
                  ]
                }
              },
              {
                loader: 'sass-loader',
                options: {
                  includePaths: [path.resolve(__dirname, 'src')]
                }
              }
            ]
          }
        ]
      }
    });
    break;
  case 'prod':
    // most of the prod specific config is provided directly by webpack as we supplied the -p flag
    // but we want to only use ExtractTextPlugin for prod, not dev
    config = merge(common, {
      devtool: 'cheap-module-source-map',

      module: {
        rules: [
          {
            test: /\.scss$/,
            exclude: /node_modules/,
            use: ExtractTextPlugin.extract({
              fallback: 'style-loader',
              use: [
                'css-loader',
                {
                  loader: 'postcss-loader',
                  options: {
                    plugins: [
                      autoprefixer({browsers: ['last 2 versions']}),
                      flexfixes()
                    ]
                  }
                },
                {
                  loader: 'sass-loader',
                  options: {
                    includePaths: [path.resolve(__dirname, 'src')]
                  }
                }
              ]
            })
          }
        ]
      },

      plugins: [
        new ExtractTextPlugin('bundle.css')
      ]
    });
    break;
  default:
    config = common;
  }

module.exports = config;
