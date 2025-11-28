// Re.Pack v5 configuration for React Native with Rspack
// This configures React Native CLI to use Re.Pack with Rspack instead of Metro
module.exports = {
  commands: require('@callstack/repack/commands/rspack'),
  project: {
    android: {
      sourceDir: './android',
    },
    ios: {
      sourceDir: './ios',
    },
  },
};

