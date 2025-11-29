ScriptManager Setup Guide for Re.Pack + React Native (Android & iOS)

This guide shows how to correctly wire ScriptManager from @callstack/repack/client into the React Native host app so that Module Federation can load remote bundles at runtime. ScriptManager is the JS API Re.Pack exposes for resolving, downloading, and executing external JS code (MF containers, chunks, etc.).
Re.Pack
+1

0. Assumptions / Goals

Host app: apps/mobile-shell (React Native).

Bundler: Re.Pack already integrated (Metro is not used).

We want:

A correct ScriptManager bootstrap in JS.

A resolver that maps script IDs → URLs.

A sanity test that ScriptManager is actually working (no MF yet).

Important: ScriptManager is not a separate native package you install.
It is part of @callstack/repack/client and is used from JS; Re.Pack handles native integration under the hood.
Re.Pack
+1

1. Ensure Re.Pack client is installed

Cursor, in the Nx workspace root:

npm install --save-dev @callstack/repack

The app should already be using Re.Pack as bundler, but this ensures the client runtime is available:

In the React Native app, ScriptManager will be imported from:

import { ScriptManager, Script } from '@callstack/repack/client';

Re.Pack
+1

2. Define a proper RN + ScriptManager bootstrap

We’ll follow Re.Pack’s recommended pattern: put all bootstrap logic in a file like src/bootstrap.ts, and import it from the platform entry (e.g., index.js).
Re.Pack
+1

2.1 Create apps/mobile-shell/src/bootstrap.ts

Cursor, create this file:

// apps/mobile-shell/src/bootstrap.ts
import { AppRegistry } from 'react-native';
import { ScriptManager, Script } from '@callstack/repack/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { App } from './App';

// 1. Configure storage for ScriptManager (optional but recommended)
// This allows caching bundles instead of re-downloading them every time. :contentReference[oaicite:4]{index=4}
ScriptManager.shared.setStorage(AsyncStorage);

// 2. Add a resolver: map scriptId -> where to load that script from.
// In dev, use Re.Pack dev server URLs. In prod, you can point to CDN.
ScriptManager.shared.addResolver(async (scriptId, caller) => {
if (**DEV**) {
// For dev, use Re.Pack's Script helper to generate dev server URLs. :contentReference[oaicite:5]{index=5}
return {
url: Script.getDevServerURL(scriptId),
};
}

// In production, point to your CDN / remote server.
// Example only – adjust to your infra:
return {
url: `https://cdn.example.com/bundles/${scriptId}.js`,
};
});

// 3. (Optional) Debug log to confirm ScriptManager is configured
if (**DEV**) {
// eslint-disable-next-line no-console
console.log('[ScriptManager] configured with storage + resolver');
}

// 4. Register the RN app
AppRegistry.registerComponent('MobileShell', () => App);

Note: the scriptId is a logical name Re.Pack uses when requesting scripts (containers, chunks, etc.). For MF, Re.Pack’s runtime will call this resolver under the hood with appropriate IDs.
Re.Pack
+1

2.2 Ensure platform entry imports the bootstrap

Your entry file for the RN app (usually apps/mobile-shell/index.js or index.ts) should look like:

// apps/mobile-shell/index.js (or index.ts)
import './src/bootstrap';

That’s it. No MF or ScriptManager logic should live here; it stays in bootstrap.

3. Verify ScriptManager is present at runtime (JS-level sanity check)

Now we add a tiny debug helper to confirm ScriptManager is actually available in JS.

3.1 Add validateScriptManager.ts
// apps/mobile-shell/src/debug/validateScriptManager.ts
import { ScriptManager } from '@callstack/repack/client';
import { NativeModules } from 'react-native';

export function logScriptManagerStatus() {
// ScriptManager is a JS singleton; we can log its internals for sanity.
// There is no separate NativeModules.ScriptManager exported, but we log anyway
// in case Re.Pack exposes additional info later.
// eslint-disable-next-line no-console
console.log('[ScriptManager Validation] ScriptManager.shared =', ScriptManager.shared);
// eslint-disable-next-line no-console
console.log('[ScriptManager Validation] NativeModules =', Object.keys(NativeModules));
}

3.2 Call it once from the App

In apps/mobile-shell/src/App.tsx:

import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { logScriptManagerStatus } from './debug/validateScriptManager';

export function App() {
useEffect(() => {
logScriptManagerStatus();
}, []);

return (
<View>
<Text>Mobile Shell</Text>
</View>
);
}

Run:

npm run mobile-shell:android

# or

npm run mobile-shell:ios

Watch logs in your RN dev console or adb logcat/Xcode. You should see:

[ScriptManager Validation] ScriptManager.shared = { ... } (not undefined).

If ScriptManager is somehow undefined, you likely:

aren’t bundling with Re.Pack,

or imported from the wrong path,

or have an old Re.Pack version that doesn’t export it under this name.

4. Optional: Minimal “can ScriptManager load anything?” test

Before bringing Module Federation back, we can test ScriptManager with a trivial hosted script. This isn’t in Re.Pack docs but follows the pattern they describe: ScriptManager resolves and executes scripts by URL.
Re.Pack
+1

4.1 Serve a tiny script from a dev server

Create a very simple JS file served by any HTTP server reachable from device:

// simple-remote.js
globalThis.**simpleRemoteExecuted = true;
globalThis.**simpleRemoteValue = 42;

Serve it at (for example):

Android emulator: http://10.0.2.2:9999/simple-remote.js

iOS simulator: http://localhost:9999/simple-remote.js

4.2 Add an explicit test loader

Add this helper:

// apps/mobile-shell/src/debug/testScriptManagerLoad.ts
import { ScriptManager } from '@callstack/repack/client';

export async function testScriptManagerLoad() {
// We bypass MF and directly ask ScriptManager’s resolver + loader to run.
// In a real app, Re.Pack’s runtime calls this under the hood. :contentReference[oaicite:8]{index=8}

try {
console.log('[ScriptManager Test] Triggering load via shared resolver');

    // We reuse the resolver we already registered in bootstrap.
    // For dev, Script.getDevServerURL(scriptId) is used.
    // For this manual test, we can temporarily hardcode our URL by
    // adding a branch in `addResolver` in bootstrap, e.g. scriptId === "simple-remote".
    await ScriptManager.shared.loadScript('simple-remote');

    console.log('[ScriptManager Test] After load: __simpleRemoteExecuted =', (globalThis as any).__simpleRemoteExecuted);
    console.log('[ScriptManager Test] After load: __simpleRemoteValue =', (globalThis as any).__simpleRemoteValue);

} catch (e) {
console.error('[ScriptManager Test] Error loading script', e);
}
}

Update the resolver inside bootstrap.ts to handle this test ID:

ScriptManager.shared.addResolver(async (scriptId, caller) => {
if (scriptId === 'simple-remote') {
// Hard-coded test URL; adjust port/host as needed.
return {
url: **DEV**
? 'http://10.0.2.2:9999/simple-remote.js'
: 'https://cdn.example.com/simple-remote.js',
};
}

if (**DEV**) {
return {
url: Script.getDevServerURL(scriptId),
};
}

return {
url: `https://cdn.example.com/bundles/${scriptId}.js`,
};
});

Then call the test from App once:

import { testScriptManagerLoad } from './debug/testScriptManagerLoad';

export function App() {
useEffect(() => {
logScriptManagerStatus();
testScriptManagerLoad();
}, []);

// ...
}

Success criteria:

No runtime error from ScriptManager.

Logs show **simpleRemoteExecuted = true and **simpleRemoteValue = 42.

At that point, you’ve proved:

ScriptManager is initialized,

Resolver works,

Script loading & execution pipeline is functional.

Now you can safely wire Module Federation on top (via Federated.importModule with ScriptManager under the hood).
Re.Pack
+1

5. What NOT to do (for Cursor)

When Cursor is applying this guide, explicitly avoid:

Implementing or replacing ScriptManager manually.

Adding huge “mock ScriptManager” JS files.

Patching Re.Pack internals in node_modules.

Trying to import some imaginary @module-federation/native-script-manager package — use @callstack/repack/client’s ScriptManager API instead, as per official docs.
Re.Pack
+1

6. Summary (for Cursor to keep in mind)

ScriptManager is part of @callstack/repack/client — import it from there.
Re.Pack
+1

Configure it once, in a bootstrap file:

setStorage(...) (for caching)

addResolver(...) (for mapping script IDs to URLs).

Make the platform entry (index.js) import the bootstrap.

Validate:

ScriptManager.shared exists.

It can load & execute a trivial remote script.

Only after this, wire Module Federation host + remote configs, letting Re.Pack’s MF runtime call ScriptManager internally.
