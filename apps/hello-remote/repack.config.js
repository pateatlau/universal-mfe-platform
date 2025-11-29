const { defineRspackConfig, RepackPlugin, getResolveOptions, plugins, getJsTransformRules, getAssetTransformRules } = require('@callstack/repack');
const { join } = require('path');
const { NormalModuleReplacementPlugin } = require('@rspack/core');

module.exports = defineRspackConfig({
  mode: process.env['NODE_ENV'] === 'production' ? 'production' : 'development',
  context: __dirname,
  entry: './src/main-mobile.tsx',
  target: 'async-node',
  output: {
    path: join(__dirname, '../../dist/apps/hello-remote-mobile'),
    publicPath: 'http://localhost:9004/',
    chunkFilename: '[name].chunk.bundle',
    filename: '[name].bundle',
    globalObject: 'globalThis',
  },
  devServer: {
    port: 9004,
    host: '0.0.0.0', // Listen on all interfaces so Android emulator can access via 10.0.2.2
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    allowedHosts: 'all',
  },
  resolve: {
    ...getResolveOptions('android'), // Use android for consistency with mobile-shell
    alias: {
      'react-native$': require.resolve('react-native'),
      '@universal-mfe-platform/shared-utils': join(__dirname, '../../libs/shared-utils/src/index.ts'),
    },
  },
  module: {
    rules: [
      ...getJsTransformRules({
        flow: {
          enabled: true,
          all: true,
        },
        codegen: {
          enabled: true,
        },
      }).map(rule => {
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
        path: join(__dirname, '../../dist/apps/hello-remote-mobile'),
      },
    }),
    // Replace DTS plugin with a mock - it tries to create websockets
    new NormalModuleReplacementPlugin(
      /@module-federation\/dts-plugin\/dist\/dynamic-remote-type-hints-plugin\.js$/,
      join(__dirname, 'src/dts-plugin-mock.js')
    ),
    // Use Re.Pack's ModuleFederationPluginV2 for mobile compatibility
    new plugins.ModuleFederationPluginV2({
      name: 'hello_remote',
      filename: 'remoteEntry.js',
      exposes: {
        './HelloRemote': './src/app/HelloRemote',
      },
      shared: {
        react: { singleton: true, eager: false, requiredVersion: '^19.0.0' },
        'react-native': { singleton: true, eager: false, requiredVersion: '~0.79.3' },
      },
      dts: false,
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

