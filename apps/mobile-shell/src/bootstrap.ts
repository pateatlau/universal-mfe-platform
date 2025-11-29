// apps/mobile-shell/src/bootstrap.ts
import { AppRegistry } from 'react-native';
import { ScriptManager, Script } from '@callstack/repack/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { App } from './app/App';

// 1. Configure storage for ScriptManager (optional but recommended)
// This allows caching bundles instead of re-downloading them every time
ScriptManager.shared.setStorage(AsyncStorage);

// 2. Add a resolver: map scriptId -> where to load that script from
// In dev, use Re.Pack dev server URLs. In prod, you can point to CDN
ScriptManager.shared.addResolver(async (scriptId, caller) => {
  console.log(
    '[ScriptManager] Resolving script:',
    scriptId,
    'from caller:',
    caller
  );

  if (__DEV__) {
    // For Module Federation, scriptId will be the remote name from remotes config
    // In our case: 'hello_remote' (lowercase with underscore)
    // This matches the remote key in rspack.config.js: hello_remote: 'hello_remote@...'

    // Try using Re.Pack's helper first
    try {
      const url = Script.getDevServerURL(scriptId);
      console.log('[ScriptManager] Resolved to dev server URL:', url);
      return { url };
    } catch (e) {
      console.warn(
        '[ScriptManager] getDevServerURL failed, using explicit URL:',
        e
      );
    }

    // Fallback to explicit URL for hello_remote
    if (scriptId === 'hello_remote' || scriptId === 'HelloRemote') {
      // Use explicit URL for now (can optimize later)
      // For Android emulator, use 10.0.2.2; for iOS simulator, use localhost
      const isAndroid = require('react-native').Platform.OS === 'android';
      const host = isAndroid ? '10.0.2.2' : 'localhost';
      const url = `http://${host}:9004/remoteEntry.js`;
      console.log('[ScriptManager] Using explicit URL:', url);
      return { url };
    }

    // Default: try dev server URL
    return {
      url: Script.getDevServerURL(scriptId),
    };
  }

  // In production, point to your CDN / remote server
  return {
    url: `https://cdn.example.com/bundles/${scriptId}.js`,
  };
});

// 3. Debug log to confirm ScriptManager is configured
if (__DEV__) {
  console.log('[ScriptManager] configured with storage + resolver');
  console.log('[ScriptManager] ScriptManager.shared:', ScriptManager.shared);
}

// 4. Register the RN app
AppRegistry.registerComponent('MobileShell', () => App);

