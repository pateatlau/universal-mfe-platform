const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withNxMetro } = require('@nx/react-native');

const defaultConfig = getDefaultConfig(__dirname);
const nxConfig = {
  // Add any Nx-specific Metro config here
};

module.exports = withNxMetro(mergeConfig(defaultConfig, nxConfig), {
  // Additional Nx options
});

