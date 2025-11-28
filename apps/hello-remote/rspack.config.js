const { NxAppRspackPlugin } = require('@nx/rspack/app-plugin');
const { NxReactRspackPlugin } = require('@nx/rspack/react-plugin');
const { ModuleFederationPlugin } = require('@rspack/core').container;
const { join } = require('path');

module.exports = {
  mode: process.env['NODE_ENV'] === 'production' ? 'production' : 'development',
  entry: './src/main.tsx',
  output: {
    path: join(__dirname, '../../dist/apps/hello-remote'),
    publicPath: 'http://localhost:9003/',
  },
  devServer: {
    port: 9003,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  plugins: [
    new NxAppRspackPlugin({
      tsConfig: './tsconfig.app.json',
      index: './src/index.html',
      baseHref: '/',
      assets: ['./src/favicon.ico', './src/assets'],
      styles: [],
      outputHashing: process.env['NODE_ENV'] === 'production' ? 'all' : 'none',
      optimization: process.env['NODE_ENV'] === 'production',
    }),
    new NxReactRspackPlugin(),
    new ModuleFederationPlugin({
      name: 'hello_remote',
      filename: 'remoteEntry.js',
      exposes: {
        './HelloRemote': './src/app/HelloRemote',
      },
      shared: {
        react: { singleton: true, eager: true, requiredVersion: '^19.0.0' },
        'react-dom': { singleton: true, eager: true, requiredVersion: '^19.0.0' },
        'react-native-web': { singleton: true, eager: true, requiredVersion: '~0.20.0' },
      },
    }),
  ],
  resolve: {
    alias: {
      'react-native$': 'react-native-web',
    },
  },
  ignoreWarnings: [
    /Failed to parse source map/,
    /ENOENT: no such file or directory/,
    /Module Warning \(from.*source-map-loader/,
    (warning) => {
      // Ignore source map warnings from node_modules
      return warning.message && (
        warning.message.includes('Failed to parse source map') ||
        warning.message.includes('source-map-loader') ||
        warning.message.includes('ENOENT')
      );
    },
  ],
};

