const { defineRspackConfig, RepackPlugin, getResolveOptions, plugins, getJsTransformRules, getAssetTransformRules } = require('@callstack/repack');
const { join } = require('path');
const { NormalModuleReplacementPlugin } = require('@rspack/core');

module.exports = defineRspackConfig({
  mode: process.env['NODE_ENV'] === 'production' ? 'production' : 'development',
  context: __dirname,
  entry: './src/main.tsx',
  target: 'async-node',
  output: {
    path: join(__dirname, '../../dist/apps/mobile-shell'),
    publicPath: 'http://localhost:8081/',
    chunkFilename: '[name].chunk.bundle',
    filename: '[name].bundle',
    globalObject: 'globalThis',
  },
  devServer: {
    port: 8081,
    host: '0.0.0.0',
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    allowedHosts: 'all',
    // Enable lazy compilation for on-demand bundle serving
    lazy: true,
  },
  resolve: {
    ...getResolveOptions('android'), // Pass platform to resolve platform-specific extensions
    alias: {
      'react-native$': require.resolve('react-native'),
    },
  },
  module: {
    rules: [
      ...getJsTransformRules({
        flow: {
          enabled: true,
          all: true, // Process all files, not just those with @flow
        },
        codegen: {
          enabled: true,
        },
      }).map(rule => {
        // Ensure Re.Pack's own ES modules are processed
        if (rule.test && rule.test.toString().includes('js|ts')) {
          return {
            ...rule,
            include: [
              ...(rule.include || []),
              /node_modules\/@callstack\/repack\/dist/,
            ],
          };
        }
        return rule;
      }),
      ...getAssetTransformRules(),
    ],
  },
  plugins: [
    new RepackPlugin({
      platform: 'android',
      output: {
        path: join(__dirname, '../../dist/apps/mobile-shell'),
      },
    }),
    // Workaround: Replace NativeScriptManager with a mock when TurboModule isn't available
    // Use NormalModuleReplacementPlugin to match relative imports
    new NormalModuleReplacementPlugin(
      /@callstack\/repack\/dist\/modules\/ScriptManager\/NativeScriptManager\.js$/,
      join(__dirname, 'src/repack-patch.js')
    ),
    // Re-enabled Module Federation now that the app is working
    new plugins.ModuleFederationPluginV2({
      name: 'mobile_shell',
      remotes: {
        hello_remote: 'hello_remote@http://localhost:9003/remoteEntry.js',
      },
      shared: {
        react: { singleton: true, eager: true, requiredVersion: '^19.0.0' },
        'react-native': { singleton: true, eager: true, requiredVersion: '~0.79.3' },
      },
    }),
  ],
  ignoreWarnings: [
    /Failed to parse source map/,
    /ENOENT: no such file or directory/,
    /Module Warning \(from.*source-map-loader/,
    (warning) => {
      return warning.message && (
        warning.message.includes('Failed to parse source map') ||
        warning.message.includes('source-map-loader') ||
        warning.message.includes('ENOENT')
      );
    },
  ],
});

