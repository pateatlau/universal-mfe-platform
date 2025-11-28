const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withNxMetro } = require('@nx/react-native');
const path = require('path');

// Project root is the mobile-shell directory
const projectRoot = __dirname;
const workspaceRoot = path.resolve(__dirname, '../..');

const defaultConfig = getDefaultConfig(projectRoot);

// Define path aliases
const pathAliases = {
  '@universal-mfe-platform/ui-universal': path.resolve(
    workspaceRoot,
    'libs/ui-universal/src/index.ts'
  ),
  '@universal-mfe-platform/api': path.resolve(
    workspaceRoot,
    'libs/api/src/index.ts'
  ),
  '@universal-mfe-platform/app-state': path.resolve(
    workspaceRoot,
    'libs/app-state/src/index.ts'
  ),
  '@universal-mfe-platform/event-bus': path.resolve(
    workspaceRoot,
    'libs/event-bus/src/index.ts'
  ),
  '@universal-mfe-platform/config-mf': path.resolve(
    workspaceRoot,
    'libs/config-mf/src/index.ts'
  ),
};

const nxConfig = {
  // Watch the entire monorepo
  watchFolders: [workspaceRoot],
  resolver: {
    ...defaultConfig.resolver,
    // Custom resolver that checks aliases first, then falls back to default
    resolveRequest: (context, realModuleName, platform, moduleName) => {
      // Check if this is one of our path aliases
      if (pathAliases[realModuleName]) {
        return {
          filePath: pathAliases[realModuleName],
          type: 'sourceFile',
        };
      }
      
      // Fall back to default resolver (which includes Nx resolver)
      return context.resolveRequest(context, realModuleName, platform, moduleName);
    },
    // Also set aliases for compatibility
    alias: pathAliases,
    // Add project source directories to resolver
    nodeModulesPaths: [
      path.resolve(workspaceRoot, 'node_modules'),
    ],
  },
  // Set project root for entry file resolution
  projectRoot: workspaceRoot,
};

module.exports = withNxMetro(mergeConfig(defaultConfig, nxConfig), {
  // Additional Nx options
});
