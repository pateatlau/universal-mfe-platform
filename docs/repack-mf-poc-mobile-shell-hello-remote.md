# Minimal Re.Pack MF v2 PoC — mobile-shell (host) + hello-remote (native remote)

This document tells Cursor how to wire a **minimal, working Re.Pack Module Federation v2 PoC** into the **existing Nx project** using:

- `apps/mobile-shell` as **host**
- `apps/hello-remote` as **remote** (native build only)
- `@callstack/repack` as bundler
- `ScriptManager` + `Federated.importModule` at runtime

We assume:

- `apps/web-shell` and the Rspack-based web remote are already working.
- `libs/shared-utils` already exists and is used.
- ScriptManager is already configured as per `docs/repack-mf-v2-scriptmanager-integration-guide.md`.

---

## 1. Add a native build entry for hello-remote

We keep `apps/hello-remote` as the shared source of truth, but add a **Re.Pack config** for its native (RN) build.

### 1.1 Add a native entry file

Create:

```ts
// apps/hello-remote/src/main-mobile.ts
import './app/HelloRemote';

// This entry exists only so Re.Pack can build the MF container.
// It does NOT call AppRegistry — the host will import HelloRemote via MF.
```

---

## 2. Re.Pack config for hello-remote (native remote)

Create:

```js
// apps/hello-remote/webpack.repack.native.mjs
import * as Repack from '@callstack/repack';
import path from 'node:path';

const dirname = Repack.getDirname(import.meta.url);

export default {
  context: dirname,
  entry: {
    app: './src/main-mobile.ts',
  },
  output: {
    path: path.join(dirname, 'dist/native'),
    filename: '[name].js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      ...Repack.getJsTransformRules(),
      ...Repack.getAssetTransformRules(),
    ],
  },
  plugins: [
    new Repack.RepackPlugin({
      platform: 'android',
    }),
    new Repack.plugins.ModuleFederationPluginV2({
      name: 'HelloRemote',
      filename: 'HelloRemote.container.js.bundle',
      exposes: {
        './HelloRemote': './src/app/HelloRemote',
      },
      shared: {
        react: { singleton: true, eager: false },
        'react-native': { singleton: true, eager: false },
        '@universal-mfe-platform/shared-utils': {
          singleton: true,
          eager: false,
        },
      },
      dts: false,
    }),
  ],
};
```

This creates a **native remote container** for React Native that the mobile host can load.

---

## 3. Re.Pack config for mobile-shell (host)

Update or create:

```js
// apps/mobile-shell/webpack.repack.mjs
import * as Repack from '@callstack/repack';
import path from 'node:path';

const dirname = Repack.getDirname(import.meta.url);

export default {
  context: dirname,
  entry: {
    app: './index.ts',
  },
  output: {
    path: path.join(dirname, 'dist'),
    filename: '[name].js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      ...Repack.getJsTransformRules(),
      ...Repack.getAssetTransformRules(),
    ],
  },
  plugins: [
    new Repack.RepackPlugin({
      platform: 'android',
    }),
    new Repack.plugins.ModuleFederationPluginV2({
      name: 'MobileHost',
      filename: 'MobileHost.container.js.bundle',
      remotes: {
        HelloRemote: 'HelloRemote',
      },
      shared: {
        react: { singleton: true, eager: false },
        'react-native': { singleton: true, eager: false },
        '@universal-mfe-platform/shared-utils': {
          singleton: true,
          eager: false,
        },
      },
      dts: false,
    }),
  ],
};
```

This turns `mobile-shell` into an MF host that can consume `HelloRemote`.

---

## 4. ScriptManager bootstrap in mobile-shell

Ensure this exists:

```ts
// apps/mobile-shell/src/bootstrap.ts
import { AppRegistry } from 'react-native';
import { ScriptManager, Script } from '@callstack/repack/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { App } from './App';

ScriptManager.shared.setStorage(AsyncStorage);

ScriptManager.shared.addResolver(async (scriptId, caller) => {
  if (__DEV__) {
    // For Android emulator; adjust port to hello-remote native dev server
    return {
      url: Script.getDevServerURL(scriptId),
    };
  }

  return {
    url: `https://cdn.example.com/bundles/${scriptId}.js`;
  };
});

if (__DEV__) {
  console.log('[ScriptManager] configured with storage + resolver');
}

AppRegistry.registerComponent('MobileShell', () => App);
```

Entry:

```ts
// apps/mobile-shell/index.ts
import './src/bootstrap';
```

---

## 5. Host runtime: load HelloRemote via Federated.importModule

Update `apps/mobile-shell/src/App.tsx`:

```ts
import React, { Suspense, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Federated } from '@callstack/repack/client';
import { getGreetingMessage } from '@universal-mfe-platform/shared-utils';

const RemoteHello = React.lazy(() =>
  Federated.importModule('HelloRemote', './HelloRemote')
);

export function App() {
  const [showRemote, setShowRemote] = useState(false);

  const handleLoadRemote = () => setShowRemote(true);

  return (
    <View style={{ padding: 24 }}>
      <Text style={{ fontSize: 20, marginBottom: 8 }}>Mobile Host</Text>
      <Text style={{ marginBottom: 16 }}>
        Shared greeting: {getGreetingMessage()}
      </Text>

      <Pressable onPress={handleLoadRemote} style={{ marginBottom: 16 }}>
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

This is the **minimal PoC**: button → load remote from hello-remote (native build) → render it.

---

## 6. Nx targets for native remote + mobile host

In `apps/hello-remote/project.json` add a Re.Pack target:

```jsonc
{
  "targets": {
    "serve-native": {
      "executor": "nx:run-commands",
      "options": {
        "command": "repack-dev-server --config apps/hello-remote/webpack.repack.native.mjs"
      }
    }
  }
}
```

In `apps/mobile-shell/project.json` add:

```jsonc
{
  "targets": {
    "serve-android": {
      "executor": "nx:run-commands",
      "options": {
        "command": "repack-dev-server --config apps/mobile-shell/webpack.repack.mjs --platform android"
      }
    }
  }
}
```

(Adjust commands to match your actual Re.Pack CLI usage.)

---

## 7. How to run the PoC

1. Start the native remote:

   ```bash
   npx nx run hello-remote:serve-native
   ```

2. Start the mobile host (Android):

   ```bash
   npx nx run mobile-shell:serve-android
   ```

3. Launch the Android app (via your existing RN/Gradle command or Nx target).

4. In the app:
   - You should see:
     - “Mobile Host”
     - Local shared-utils greeting
   - Tap **“Load Remote Hello”** → it should render the HelloRemote component from `hello-remote`.

If that works, you have a working **Re.Pack MFv2 + ScriptManager PoC** using your real `mobile-shell` + `hello-remote` apps.
