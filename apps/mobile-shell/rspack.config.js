const { ModuleFederationPlugin } = require('@rspack/core').container;
const { NxAppRspackPlugin } = require('@nx/rspack/app-plugin');
const { NxReactRspackPlugin } = require('@nx/rspack/react-plugin');
const { join } = require('path');

module.exports = {
  output: {
    path: join(__dirname, '../../dist/apps/mobile-shell'),
    publicPath: 'http://localhost:8081/',
  },
  plugins: [
    new NxAppRspackPlugin({
      tsConfig: './tsconfig.app.json',
      main: './src/main.tsx',
      baseHref: '/',
      assets: ['./src/assets'],
      styles: [],
      outputHashing: process.env['NODE_ENV'] === 'production' ? 'all' : 'none',
      optimization: process.env['NODE_ENV'] === 'production',
    }),
    new NxReactRspackPlugin(),
    new ModuleFederationPlugin({
      name: 'mobile_shell',
      remotes: {
        hello_remote: 'hello_remote@http://localhost:9003/remoteEntry.js',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.3.1' },
        'react-native': { singleton: true, requiredVersion: '^0.76.5' },
      },
    }),
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
    alias: {
      'react-native$': require.resolve('react-native'),
    },
  },
};

