# Re.Pack Module Federation v2 + ScriptManager Integration Guide

> This guide tells Cursor exactly how to integrate `ModuleFederationPluginV2` with `ScriptManager` in a React Native + Re.Pack environment, assuming ScriptManager is already available from `@callstack/repack/client`.

---

## 0. Precondition — ScriptManager Bootstrap (Host App)

Create `apps/mobile-shell/src/bootstrap.ts`:

```ts
import { AppRegistry } from 'react-native';
import { ScriptManager, Script } from '@callstack/repack/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { App } from './App';

ScriptManager.shared.setStorage(AsyncStorage);

ScriptManager.shared.addResolver(async (scriptId, caller) => {
  if (__DEV__) {
    return {
      url: Script.getDevServerURL(scriptId),
    };
  }

  return {
    url: `https://cdn.example.com/bundles/${scriptId}.js`,
  };
});

if (__DEV__) {
  console.log('[ScriptManager] configured with storage + resolver');
}

AppRegistry.registerComponent('MobileShell', () => App);
```

Entry file:

```ts
import './src/bootstrap';
```

---

## 1. Remote App — Configure ModuleFederationPluginV2

Create or update `apps/hello-remote-mobile/webpack.repack.config.mjs`:

```js
import * as Repack from '@callstack/repack';
import path from 'node:path';

const dirname = Repack.getDirname(import.meta.url);

export default {
  context: dirname,
  entry: { app: './index.ts' },
  output: {
    path: path.join(dirname, 'dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      ...Repack.getJsTransformRules(),
      ...Repack.getAssetTransformRules(),
    ],
  },
  plugins: [
    new Repack.RepackPlugin({ platform: 'android' }),
    new Repack.plugins.ModuleFederationPluginV2({
      name: 'HelloRemote',
      filename: 'HelloRemote.container.js.bundle',
      exposes: {
        './HelloRemote': './src/app/HelloRemote',
      },
      shared: {
        react: { singleton: true, eager: false },
        'react-native': { singleton: true, eager: false },
      },
      dts: false,
    }),
  ],
};
```

Remote entry should **not mount** a UI via `AppRegistry`; it only needs to register MF container.

---

## 2. Host App — Configure ModuleFederationPluginV2

Create or update `apps/mobile-shell/webpack.repack.config.mjs`:

```js
import * as Repack from '@callstack/repack';
import path from 'node:path';

const dirname = Repack.getDirname(import.meta.url);

export default {
  context: dirname,
  entry: { app: './index.ts' },
  output: {
    path: path.join(dirname, 'dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      ...Repack.getJsTransformRules(),
      ...Repack.getAssetTransformRules(),
    ],
  },
  plugins: [
    new Repack.RepackPlugin({ platform: 'android' }),
    new Repack.plugins.ModuleFederationPluginV2({
      name: 'MobileHost',
      filename: 'MobileHost.container.js.bundle',
      remotes: {
        HelloRemote: 'HelloRemote',
      },
      shared: {
        react: { singleton: true, eager: false },
        'react-native': { singleton: true, eager: false },
      },
      dts: false,
    }),
  ],
};
```

Host remotes match remote names exactly.

---

## 3. Host Runtime — Use Federated.importModule

Update `apps/mobile-shell/src/App.tsx`:

```ts
import React, { Suspense, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Federated } from '@callstack/repack/client';

const RemoteHello = React.lazy(() =>
  Federated.importModule('HelloRemote', './HelloRemote')
);

export function App() {
  const [showRemote, setShowRemote] = useState(false);

  const handleLoadRemote = () => setShowRemote(true);

  return (
    <View style={{ padding: 24 }}>
      <Text style={{ fontSize: 20, marginBottom: 16 }}>Mobile Host</Text>

      <Pressable onPress={handleLoadRemote}>
        <Text>Load Remote Hello</Text>
      </Pressable>

      {showRemote && (
        <Suspense fallback={<Text>Loading remote…</Text>}>
          <RemoteHello />
        </Suspense>
      )}
    </View>
  );
}
```

---

## 4. Whether Native Module Registration Is Needed

**No manual native module registration is needed.**

Cursor must **not**:

- Create a custom native module for ScriptManager.
- Add TurboModule registration code.
- Modify Android/iOS native code beyond what Re.Pack already requires.

Re.Pack provides ScriptManager from `@callstack/repack/client` and integrates with RN’s existing native module system.

---

## 5. New Architecture Compatibility

- Works on both Old Architecture and New Architecture (Fabric/TurboModules).
- If New Architecture is enabled:
  - Ensure React Native builds cleanly with Re.Pack.
  - Cursor must not create native module shims.

ScriptManager and MFv2 do **not** require writing C++ TurboModules.

---

## 6. Error Handling & Troubleshooting

### 6.1 ScriptManager is undefined
- Ensure proper import:
  ```ts
  import { ScriptManager } from '@callstack/repack/client';
  ```
- App must be using **Re.Pack**, not Metro.
- Ensure bootstrap is imported from entry file.

### 6.2 Suspense forever / remote never loads
- Remote dev server not running.
- Wrong URL from resolver — confirm with `console.log` inside resolver.
- MF name mismatch:
  - Remote: `name: 'HelloRemote'`
  - Host: `Federated.importModule('HelloRemote', './HelloRemote')`

### 6.3 “container not found” errors
- Remote did not register MF container.
- Remote bundle is not being served or built via ModuleFederationPluginV2.

### 6.4 404 errors
- Android emulator → use `10.0.2.2`
- iOS simulator → `localhost`
- Dev server must bind to `0.0.0.0`.

### 6.5 Hermes / JS runtime issues
- Clear caches and rebuild.
- Ensure Re.Pack and React Native versions are compatible.

---

## 7. Summary for Cursor

When implementing this integration, Cursor must:

1. Use **ModuleFederationPluginV2** from `@callstack/repack`.
2. Never mock or replace `ScriptManager`.
3. Place all ScriptManager logic in a clean `bootstrap.ts` file.
4. Keep MF `name`, `filename`, and `exposes` consistent with host import paths.
5. Use `Federated.importModule` to load remote components.
6. Resolve bundle URLs through ScriptManager, not hardcoded strings.
7. Debug issues via ScriptManager resolver and MF runtime logs.

