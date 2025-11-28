const { composePlugins, withNx } = require('@nx/webpack');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const { getSharedConfig, getRemotesConfig } = require('@universal-mfe-platform/config-mf');

/**
 * Webpack configuration for mobile-shell (Re.Pack with Module Federation)
 * 
 * Re.Pack uses webpack under the hood for React Native bundling.
 * This configuration enables Module Federation for loading remotes.
 * 
 * Note: In production, this would use Re.Pack's webpack configuration.
 * For POC-0, we're setting up the basic structure.
 */
module.exports = composePlugins(withNx(), (config) => {
  // Development remotes (local dev servers)
  const devRemotes = [
    {
      name: 'feature_home_remote',
      url: 'http://localhost:4201',
      entry: 'remoteEntry.native.js',
    },
  ];

  config.plugins.push(
    new ModuleFederationPlugin({
      name: 'mobile_shell',
      remotes: getRemotesConfig(devRemotes),
      shared: getSharedConfig(),
    })
  );

  return config;
});
