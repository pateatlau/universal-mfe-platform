const { composePlugins, withNx } = require('@nx/rspack');
const { ModuleFederationPlugin } = require('@module-federation/rspack');
const { HtmlRspackPlugin } = require('@rspack/core');
const ReactRefreshPlugin = require('@rspack/plugin-react-refresh');
const path = require('path');

/**
 * Module Federation shared dependencies configuration
 */
const getSharedConfig = () => ({
  react: {
    singleton: true,
    strictVersion: true,
    requiredVersion: '^18.3.1',
    eager: true, // Set to true to avoid RUNTIME-006 error - React needs to be available synchronously
  },
  'react-dom': {
    singleton: true,
    strictVersion: true,
    requiredVersion: '^18.3.1',
    eager: true, // Set to true to avoid RUNTIME-006 error - ReactDOM needs to be available synchronously
  },
  // Note: react-native is aliased to react-native-web for web platform
  // We don't share react-native on web since it's replaced by react-native-web
  'react-native-web': {
    singleton: true,
    strictVersion: true,
    requiredVersion: '^0.19.13',
    eager: false,
  },
});

/**
 * Get remotes configuration for Module Federation
 */
const getRemotesConfig = (remotes) => {
  return remotes.reduce((acc, remote) => {
    acc[remote.name] = `${remote.name}@${remote.url}/${remote.entry}`;
    return acc;
  }, {});
};

/**
 * Rspack configuration for web-shell (Module Federation Host)
 *
 * This host application loads remotes dynamically via manifest.
 * In development, remotes are resolved from local dev servers.
 * In production, remotes are resolved from the manifest file.
 */
module.exports = composePlugins(withNx(), (config) => {
  // Development remotes (local dev servers)
  const devRemotes = [
    {
      name: 'feature_home_remote',
      url: 'http://localhost:4201',
      entry: 'remoteEntry.web.js',
    },
  ];

  // Configure HMR for Module Federation
  const isDev =
    config.mode === 'development' || process.env.NODE_ENV !== 'production';

  // Set publicPath for Module Federation
  config.output = config.output || {};
  if (isDev) {
    // In development, use '/' for HMR to work correctly
    config.output.publicPath = '/';
  } else {
    // In production, use 'auto' for Module Federation
    config.output.publicPath = 'auto';
  }

  if (isDev) {
    // Use unique chunk loading global to avoid conflicts with remotes
    config.output.chunkLoadingGlobal = 'webpackChunkweb_shell';
    // Ensure HMR is enabled with proper configuration
    config.devServer = config.devServer || {};
    config.devServer.hot = true;
    config.devServer.liveReload = false; // Disable live reload in favor of HMR
    // Configure HMR client to use correct publicPath
    config.devServer.client = {
      ...config.devServer.client,
      webSocketURL: 'auto://0.0.0.0:0/ws',
    };
  }

  // Suppress all warnings from @module-federation packages
  // These packages don't include source maps in their distributions
  config.ignoreWarnings = config.ignoreWarnings || [];
  config.ignoreWarnings.push(
    // Suppress source map warnings
    /Failed to parse source map/,
    /ENOENT.*error-codes/,
    /ENOENT.*getShortErrorMsg/,
    /ENOENT.*desc\.ts/,
    /@module-federation\/error-codes/,
    // Function-based filter for more comprehensive warning suppression
    (warning) => {
      if (!warning || !warning.message) return false;
      const msg = warning.message.toString();
      return (
        msg.includes('Failed to parse source map') ||
        msg.includes('ENOENT') ||
        msg.includes('@module-federation') ||
        msg.includes('source-map-loader')
      );
    }
  );

  // Add React Native Web aliases
  config.resolve = config.resolve || {};
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native$': 'react-native-web',
  };

  // Remove ALL HTML plugins to prevent "Multiple assets emit" error
  // We'll add a single HtmlRspackPlugin manually after filtering
  const htmlPluginNames = [
    'HtmlRspackPlugin',
    'HtmlPlugin',
    'WriteIndexHtmlPlugin',
  ];
  const htmlPlugins = [];
  config.plugins = config.plugins.filter((plugin) => {
    const pluginName =
      plugin.constructor?.name || plugin.name || String(plugin);
    const isHtmlPlugin = htmlPluginNames.some(
      (name) => pluginName.includes(name) || pluginName === name
    );

    if (isHtmlPlugin) {
      htmlPlugins.push(plugin);
      return false; // Remove all HTML plugins
    }
    return true; // Keep all non-HTML plugins
  });

  // Add a single HTML plugin manually
  if (htmlPlugins.length > 0) {
    console.log(
      `Found ${htmlPlugins.length} HTML plugin(s), replacing with single HtmlRspackPlugin`
    );
  }
  config.plugins.push(
    new HtmlRspackPlugin({
      template: path.resolve(__dirname, './src/index.html'),
    })
  );

  config.plugins.push(
    new ModuleFederationPlugin({
      name: 'web_shell',
      remotes: getRemotesConfig(devRemotes),
      shared: getSharedConfig(),
      // Configure HMR for Module Federation
      runtimePlugins: [],
    })
  );

  // Add React Refresh plugin for Hot Module Replacement in development
  if (isDev) {
    config.plugins.push(new ReactRefreshPlugin());
  }

  return config;
});
