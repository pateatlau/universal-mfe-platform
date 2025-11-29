# Re.Pack MF v2 + ScriptManager Integration Checklist (for Cursor)

This checklist guides Cursor step-by-step to integrate Module Federation v2 + ScriptManager into the existing Nx Universal MFE project.

---

## ✅ 0. Prep

- [ ] Confirm bundler for mobile-shell is **Re.Pack** (not Metro).
- [ ] Confirm `libs/shared-utils` exists and builds.
- [ ] Add `docs/repack-mf-v2-scriptmanager-integration-guide.md` to the repo (optional but recommended).

---

## ✅ 1. ScriptManager Bootstrap (mobile-shell)

1. [ ] Create `apps/mobile-shell/src/bootstrap.ts` with:
   - ScriptManager import from `@callstack/repack/client`.
   - Storage: `ScriptManager.shared.setStorage(AsyncStorage)`.
   - Resolver: `ScriptManager.shared.addResolver(...)` using `Script.getDevServerURL(scriptId)` in dev.
   - `AppRegistry.registerComponent('MobileShell', () => App);`
2. [ ] Update `apps/mobile-shell/index.ts` (or `index.js`) to import `./src/bootstrap`.
3. [ ] Add a temporary log helper to confirm ScriptManager exists at runtime.

---

## ✅ 2. Native Remote Build (hello-remote)

1. [ ] Add `apps/hello-remote/src/main-mobile.ts` that imports `./app/HelloRemote` only.
2. [ ] Create Re.Pack config `apps/hello-remote/webpack.repack.native.mjs`:
   - Uses `Repack.RepackPlugin({ platform: 'android' })`.
   - Uses `Repack.plugins.ModuleFederationPluginV2` with:
     - `name: 'HelloRemote'`
     - `filename: 'HelloRemote.container.js.bundle'`
     - `exposes: { './HelloRemote': './src/app/HelloRemote' }`
     - minimal `shared` including `react`, `react-native`, `shared-utils`.
3. [ ] Add Nx target `hello-remote:serve-native` to run the Re.Pack dev server.

---

## ✅ 3. Host MF Config (mobile-shell)

1. [ ] Create or update `apps/mobile-shell/webpack.repack.mjs`:
   - Uses `Repack.RepackPlugin`.
   - Uses `Repack.plugins.ModuleFederationPluginV2` with:
     - `name: 'MobileHost'`
     - `filename: 'MobileHost.container.js.bundle'`
     - `remotes: { HelloRemote: 'HelloRemote' }`
     - `shared` including `react`, `react-native`, `shared-utils`.
2. [ ] Add Nx target `mobile-shell:serve-android` that runs Re.Pack dev server with this config.

---

## ✅ 4. Host Runtime Logic (mobile-shell/src/App.tsx)

1. [ ] Import `Federated` from `@callstack/repack/client`.
2. [ ] Create a `React.lazy` wrapper using `Federated.importModule('HelloRemote', './HelloRemote')`.
3. [ ] Add a button `"Load Remote Hello"` that toggles rendering of a `<RemoteHello />` component inside a `<Suspense>` boundary.
4. [ ] Use RN primitives only (`View`, `Text`, `Pressable`).

---

## ✅ 5. Shared Utils Wiring

1. [ ] Ensure `@universal-mfe-platform/shared-utils` path mapping exists in `tsconfig.base.json`.
2. [ ] Ensure both `hello-remote` and `mobile-shell` can import `getGreetingMessage()` from shared-utils.
3. [ ] Update App UI to show a local shared-utils greeting to confirm shared code is working.

---

## ✅ 6. Run & Verify

1. [ ] Start native remote dev server:

   ```bash
   npx nx run hello-remote:serve-native
   ```

2. [ ] Start mobile-shell dev server:

   ```bash
   npx nx run mobile-shell:serve-android
   ```

3. [ ] Launch the Android app.
4. [ ] Verify:
   - The app shows host screen with shared-utils greeting.
   - Tapping `"Load Remote Hello"` uses `Federated.importModule` to load and render HelloRemote.

---

## ✅ 7. Troubleshooting Checklist

- [ ] If ScriptManager is `undefined`:
  - Check import path.
  - Ensure mobile-shell is built with Re.Pack, not Metro.
  - Confirm `bootstrap.ts` is imported from entry.

- [ ] If Suspense never resolves:
  - Confirm `HelloRemote.container.js.bundle` is reachable from emulator (use browser).
  - Log inside `ScriptManager.shared.addResolver` to confirm scriptId and URL.
  - Confirm MF `name`/`exposes` match `Federated.importModule` usage.

- [ ] If “container not found”:
  - Ensure remote config uses `ModuleFederationPluginV2`.
  - Ensure `name: 'HelloRemote'` and `exposes: { './HelloRemote': './src/app/HelloRemote' }` exactly.
  - Confirm remote build is using the MF config, not a stale one.

---

## ✅ 8. Final Cleanup

- [ ] Remove any old ScriptManager mocks or patches.
- [ ] Remove unused MF configs that reference other plugins (e.g., Rspack MF) from native apps.
- [ ] Keep MF + ScriptManager logic centralized in:
  - `apps/hello-remote/webpack.repack.native.mjs`
  - `apps/mobile-shell/webpack.repack.mjs`
  - `apps/mobile-shell/src/bootstrap.ts`
  - `apps/mobile-shell/src/App.tsx`

Once all boxes are ticked, the **Re.Pack MF v2 + ScriptManager integration is considered complete** for the mobile path.
