/**
 * Manifest Loader
 * 
 * Loads and resolves remote module federation configurations from a manifest file.
 * The manifest contains versioned remote entries for both web and native platforms.
 */

export interface RemoteManifest {
  version: string;
  remotes: RemoteEntry[];
}

export interface RemoteEntry {
  name: string;
  version: string;
  web?: {
    url: string;
    entry: string;
  };
  native?: {
    url: string;
    entry: string;
  };
}

export interface LoadedRemote {
  name: string;
  url: string;
  entry: string;
  version: string;
}

/**
 * Loads the remote manifest from the specified URL
 */
export async function loadManifest(manifestUrl: string): Promise<RemoteManifest> {
  try {
    const response = await fetch(manifestUrl);
    if (!response.ok) {
      throw new Error(`Failed to load manifest: ${response.statusText}`);
    }
    const manifest: RemoteManifest = await response.json();
    return manifest;
  } catch (error) {
    console.error('Error loading manifest:', error);
    throw error;
  }
}

/**
 * Resolves a remote entry from the manifest based on name and platform
 */
export function resolveRemote(
  manifest: RemoteManifest,
  remoteName: string,
  platform: 'web' | 'native'
): LoadedRemote | null {
  const remote = manifest.remotes.find((r) => r.name === remoteName);
  if (!remote) {
    console.warn(`Remote "${remoteName}" not found in manifest`);
    return null;
  }

  const platformConfig = platform === 'web' ? remote.web : remote.native;
  if (!platformConfig) {
    console.warn(`Platform "${platform}" not supported for remote "${remoteName}"`);
    return null;
  }

  return {
    name: remote.name,
    url: platformConfig.url,
    entry: platformConfig.entry,
    version: remote.version,
  };
}

/**
 * Resolves all remotes for a given platform
 */
export function resolveAllRemotes(
  manifest: RemoteManifest,
  platform: 'web' | 'native'
): LoadedRemote[] {
  return manifest.remotes
    .map((remote) => {
      const platformConfig = platform === 'web' ? remote.web : remote.native;
      if (!platformConfig) return null;
      return {
        name: remote.name,
        url: platformConfig.url,
        entry: platformConfig.entry,
        version: remote.version,
      };
    })
    .filter((remote): remote is LoadedRemote => remote !== null);
}

