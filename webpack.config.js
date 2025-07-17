const { ModuleFederationPlugin } = require('webpack').container;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';
const publicPath = isProduction ? 'https://cdn.chestmusic.com/player-mf/' : 'http://localhost:3001/';

module.exports = {
  mode: isProduction ? 'production' : 'development',
  entry: './src/index.js',
  target: 'web',
  
  devServer: {
    port: 3001,
    host: '0.0.0.0',
    hot: true,
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    }
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: isProduction ? '[name].[contenthash].js' : '[name].js',
    publicPath,
    clean: true
  },

  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@core': path.resolve(__dirname, 'src/core'),
      '@services': path.resolve(__dirname, 'src/services')
    }
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|ico)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/[name].[hash][ext]'
        }
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[name].[hash][ext]'
        }
      }
    ]
  },

  plugins: [
    new ModuleFederationPlugin({
      name: 'chestPlayerMF',
      filename: 'remoteEntry.js',
      exposes: {
        // Core functionality
        './Player': './src/components/Player.js',
        './PlayerProvider': './src/core/context/PlayerProvider.js',
        './useAudioPlayer': './src/core/hooks/useAudioPlayer.js',
        
        // Skins
        './PlayerWeb': './src/components/skins/PlayerWeb.js',
        './PlayerMobile': './src/components/skins/PlayerMobile.js',
        
        // Utilities
        './playerUtils': './src/core/utils/index.js'
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: '^18.2.0'
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^18.2.0'
        },
        '@reduxjs/toolkit': {
          singleton: true,
          requiredVersion: '^1.9.5'
        },
        'react-redux': {
          singleton: true,
          requiredVersion: '^8.1.1'
        },
        'framer-motion': {
          singleton: false,
          requiredVersion: '^10.12.17'
        }
      }
    }),
    
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
      title: 'Chest Player Micro-frontend'
    }),

    ...(isProduction ? [
      new MiniCssExtractPlugin({
        filename: '[name].[contenthash].css'
      })
    ] : [])
  ],

  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10
        },
        default: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true
        }
      }
    }
  },

  stats: {
    errorDetails: true
  }
};