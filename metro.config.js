const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withNxMetro } = require('@nx/react-native');
const path = require('path');

const workspaceRoot = __dirname;
const defaultConfig = getDefaultConfig(workspaceRoot);

// Configure for monorepo structure
const nxConfig = {
  // Watch the entire monorepo
  watchFolders: [workspaceRoot],
  // Resolve modules from workspace root
  resolver: {
    ...defaultConfig.resolver,
    // Resolve TypeScript path aliases from tsconfig.base.json
    alias: {
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
    },
    // Add project source directories to resolver
    nodeModulesPaths: [
      path.resolve(workspaceRoot, 'node_modules'),
    ],
  },
};

module.exports = withNxMetro(mergeConfig(defaultConfig, nxConfig), {
  // Additional Nx options
});
