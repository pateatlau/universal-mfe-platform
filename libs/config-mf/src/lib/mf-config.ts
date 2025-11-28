/**
 * Module Federation Configuration
 * 
 * Centralized configuration for Module Federation shared dependencies
 * and remote resolution.
 */

export interface SharedConfig {
  [key: string]: {
    singleton?: boolean;
    strictVersion?: boolean;
    requiredVersion?: string;
    eager?: boolean;
  };
}

/**
 * Default shared dependencies configuration for Module Federation
 * Ensures consistent versions across remotes and hosts
 */
export const getSharedConfig = (): SharedConfig => ({
  react: {
    singleton: true,
    strictVersion: true,
    requiredVersion: '^18.3.1',
    eager: false,
  },
  'react-dom': {
    singleton: true,
    strictVersion: true,
    requiredVersion: '^18.3.1',
    eager: false,
  },
  'react-native': {
    singleton: true,
    strictVersion: true,
    requiredVersion: '^0.76.5',
    eager: false,
  },
  'react-native-web': {
    singleton: true,
    strictVersion: true,
    requiredVersion: '^0.19.13',
    eager: false,
  },
});

/**
 * Get remotes configuration for Module Federation
 * This is a placeholder - actual remotes are resolved at runtime via manifest
 */
export const getRemotesConfig = (remotes: Array<{ name: string; url: string; entry: string }>) => {
  return remotes.reduce((acc, remote) => {
    acc[remote.name] = `${remote.name}@${remote.url}/${remote.entry}`;
    return acc;
  }, {} as Record<string, string>);
};

