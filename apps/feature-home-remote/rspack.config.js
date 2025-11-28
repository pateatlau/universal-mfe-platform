const { composePlugins, withNx } = require('@nx/rspack');
const { ModuleFederationPlugin } = require('@module-federation/rspack');
const ReactRefreshPlugin = require('@rspack/plugin-react-refresh');

/**
 * Module Federation shared dependencies configuration
 */
const getSharedConfig = () => ({
  react: {
    singleton: true,
    strictVersion: true,
    requiredVersion: '^18.3.1',
    eager: true,
  },
  'react-dom': {
    singleton: true,
    strictVersion: true,
    requiredVersion: '^18.3.1',
    eager: true,
  },
  'react-native-web': {
    singleton: true,
    strictVersion: true,
    requiredVersion: '^0.19.13',
    eager: false,
  },
});

/**
 * Rspack configuration for feature-home-remote
 *
 * This remote exposes a single normalized entry point that works
 * for both web and native platforms.
 */
module.exports = composePlugins(withNx(), (config) => {
  // Configure HMR for Module Federation remote
  const isDev =
    config.mode === 'development' || process.env.NODE_ENV !== 'production';
  if (isDev) {
    config.output = config.output || {};
    // CRITICAL: For Module Federation remotes, publicPath must be 'auto'
    // so chunks are loaded from the remote server, not the host server
    // This ensures Module Federation works correctly
    config.output.publicPath = 'auto';

    // Set unique chunk loading global to prevent conflicts
    // This must match what we initialize in index.html and main.web.tsx
    config.output.chunkLoadingGlobal = 'webpackChunkfeature_home_remote';

    // Configure dev server
    // Disable HMR for standalone mode to prevent crashes
    // HMR works correctly when remote is consumed via Module Federation from the host
    config.devServer = config.devServer || {};
    config.devServer.hot = false; // Disable HMR to prevent crashes in standalone mode
    config.devServer.liveReload = true; // Use live reload instead for standalone mode
    config.devServer.client = {
      ...config.devServer.client,
      overlay: {
        errors: true,
        warnings: false,
      },
    };
  }

  // Suppress source map warnings for @module-federation packages
  // These packages don't include source maps in their distributions
  config.ignoreWarnings = config.ignoreWarnings || [];
  config.ignoreWarnings.push(
    /Failed to parse source map/,
    /ENOENT.*error-codes/,
    /ENOENT.*getShortErrorMsg/,
    /ENOENT.*desc\.ts/,
    /@module-federation\/error-codes/,
    (warning) => {
      // Suppress all source map warnings from @module-federation packages
      return (
        warning.message &&
        (warning.message.includes('Failed to parse source map') ||
          warning.message.includes('ENOENT') ||
          warning.message.includes('@module-federation'))
      );
    }
  );

  // Add React Native Web aliases
  config.resolve = config.resolve || {};
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native$': 'react-native-web',
  };

  config.plugins.push(
    new ModuleFederationPlugin({
      name: 'feature_home_remote',
      filename: 'remoteEntry.web.js',
      exposes: {
        './HomeScreen': './src/entry.tsx',
      },
      shared: getSharedConfig(),
      // Configure HMR for Module Federation remote
      runtimePlugins: [],
    })
  );

  // Add React Refresh plugin for Hot Module Replacement in development
  if (isDev) {
    // Configure React Refresh plugin
    // This enables React Fast Refresh for component updates
    config.plugins.push(
      new ReactRefreshPlugin({
        overlay: false, // Disable error overlay to prevent conflicts
        exclude: [/node_modules/], // Exclude node_modules from React Refresh
      })
    );

    // Ensure React Refresh loader is used for JS/TS files
    // Rspack should automatically use builtin:react-refresh-loader when ReactRefreshPlugin is added
    // But we can verify the module rules are correct
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];

    // Check if we need to add react-refresh loader explicitly
    // Usually ReactRefreshPlugin handles this automatically
  }

  return config;
});
