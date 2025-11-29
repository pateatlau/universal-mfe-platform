const { NxAppRspackPlugin } = require('@nx/rspack/app-plugin');
const { NxReactRspackPlugin } = require('@nx/rspack/react-plugin');
const { ModuleFederationPlugin } = require('@rspack/core').container;
const { NormalModuleReplacementPlugin, IgnorePlugin } = require('@rspack/core');
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
    host: '0.0.0.0', // Listen on all interfaces so Android emulator can access via 10.0.2.2
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    allowedHosts: 'all', // Allow connections from any host (needed for Android emulator)
    // Disable HMR for React Native compatibility
    // HMR code references webpack Logger which doesn't exist in RN
    hot: false,
    liveReload: false,
    // Keep client enabled but disable HMR features
    // client: false breaks the dev server's ability to serve files
    // Instead, we'll use plugins to exclude HMR code from the bundle
  },
  // Exclude HMR-related code from bundle
  optimization: {
    minimize: false, // Keep readable for debugging, but production mode excludes HMR
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
    new NxReactRspackPlugin({
      // Disable React Refresh for remoteEntry.js to avoid Logger dependencies
      // React Refresh pulls in HMR code that references Logger
      refresh: false,
    }),
    // Exclude dev-server client and HMR code from remoteEntry.js for React Native compatibility
    // Use IgnorePlugin to completely exclude these modules
    new IgnorePlugin({
      resourceRegExp: /@rspack\/dev-server\/client/,
    }),
    new IgnorePlugin({
      resourceRegExp: /@rspack\/core\/hot/,
    }),
    // Also use NormalModuleReplacementPlugin as fallback
    new NormalModuleReplacementPlugin(
      /@rspack\/dev-server\/client/,
      require.resolve('./src/dev-server-client-mock.js')
    ),
    new NormalModuleReplacementPlugin(
      /@rspack\/core\/hot/,
      require.resolve('./src/hot-mock.js')
    ),
    // Replace webpack Logger modules that HMR code depends on
    // Use multiple patterns to catch all variations
    new NormalModuleReplacementPlugin(
      /webpack[\\/]lib[\\/]logging[\\/]Logger\.js$/,
      require.resolve('./src/logger-mock.js')
    ),
    new NormalModuleReplacementPlugin(
      /webpack[\\/]lib[\\/]logging[\\/]createConsoleLogger\.js$/,
      require.resolve('./src/logger-mock.js')
    ),
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

