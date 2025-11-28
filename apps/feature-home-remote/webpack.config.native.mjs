import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as Repack from '@callstack/repack';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root of the monorepo
const rootDir = path.resolve(__dirname, '../..');

/**
 * Re.Pack Webpack Configuration for Feature Home Remote (Native) (v5 API)
 *
 * This configuration exposes the HomeScreen component via Module Federation
 * for native platforms (iOS/Android).
 *
 * @param env - Webpack environment variables
 * @returns Webpack configuration
 */
export default (env) => {
  const {
    mode = 'development',
    platform = process.env.PLATFORM || 'android',
  } = env;

  return {
    mode,
    context: __dirname,
    entry: './src/entry.native.tsx',
    devtool: mode === 'development' ? 'source-map' : false,
    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
      alias: {
        // Handle monorepo path aliases
        '@universal-mfe-platform/ui-universal': path.join(
          rootDir,
          'libs/ui-universal/src/index.ts'
        ),
      },
    },
    output: {
      clean: true,
      hashFunction: 'xxhash64',
      path: path.join(__dirname, 'build/generated', platform),
      filename: 'index.bundle',
      chunkFilename: '[name].chunk.bundle',
    },
    optimization: {
      minimize: mode === 'production',
      chunkIds: 'named',
    },
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/,
          include: [
            /node_modules(.*[/\\])+react-native/,
            /node_modules(.*[/\\])+@react-native/,
            /node_modules(.*[/\\])+@react-navigation/,
            /node_modules(.*[/\\])+react-native-svg/,
            /node_modules(.*[/\\])+@react-native-async-storage/,
            /node_modules(.*[/\\])+@callstack\/repack/,
          ],
          use: 'babel-loader',
        },
        {
          test: /\.[jt]sx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['module:@react-native/babel-preset'],
            },
          },
        },
        // Asset handling - spread the array returned by getAssetTransformRules
        ...Repack.getAssetTransformRules({ svg: true }),
      ],
    },
    plugins: [
      // Re.Pack plugin - handles all native initialization
      new Repack.RepackPlugin({
        platform,
      }),

      // Module Federation Plugin V2 - Expose HomeScreen for native (recommended in Re.Pack 5)
      new Repack.plugins.ModuleFederationPluginV2({
        name: 'feature_home_remote',
        exposes: {
          './HomeScreen': './src/screens/HomeScreen.tsx',
        },
        shared: {
          react: {
            singleton: true,
            eager: true,
            requiredVersion: '^18.3.1',
          },
          'react-native': {
            singleton: true,
            eager: true,
            requiredVersion: '~0.76.3',
          },
        },
      }),
    ],
  };
};
