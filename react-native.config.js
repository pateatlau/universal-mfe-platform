/**
 * React Native CLI Configuration
 *
 * This file configures the React Native CLI for the monorepo structure.
 * Re.Pack commands are conditionally registered only when needed.
 */
module.exports = {
  project: {
    ios: {
      sourceDir: './apps/mobile-shell/ios',
    },
    android: {
      sourceDir: './apps/mobile-shell/android',
      appName: 'app',
      packageName: 'com.mobileshell',
    },
  },
  // Conditionally register Re.Pack commands
  // Only register if explicitly using Re.Pack (webpack-start/webpack-bundle)
  // This allows Metro to work normally with 'react-native start'
  getCommands: () => {
    // Only return Re.Pack commands if webpack config exists
    // This allows Metro to work by default
    try {
      const fs = require('fs');
      const path = require('path');
      const webpackConfig = path.join(__dirname, 'apps/mobile-shell/webpack.config.mjs');
      if (fs.existsSync(webpackConfig)) {
        return require('@callstack/repack/commands/webpack');
      }
    } catch (e) {
      // If Re.Pack is not available, return empty commands
    }
    return [];
  },
};
