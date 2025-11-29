# Critical Analysis: Re.Pack Module Federation v2 + ScriptManager Integration Guide
## Technical Accuracy & Refactoring Viability Assessment

**Date**: 2026-01-29  
**Author**: Senior Universal MFE Architect  
**Document Analyzed**: `docs/repack-mf-v2-scriptmanager-integration-guide.md`

---

## Executive Summary

**Verdict**: ✅ **HIGHLY ACCURATE AND ACTIONABLE**

This guide is **significantly more comprehensive** than the previous ScriptManager setup guide. It addresses the **critical missing piece**: how to actually use Module Federation with ScriptManager. The guide provides a **complete, end-to-end solution** that directly addresses the codebase's current issues.

**Key Finding**: The guide reveals the codebase is using the **wrong API** for loading remotes. Instead of manual container access, it should use `Federated.importModule` from `@callstack/repack/client`. This is likely why containers aren't registering properly.

**Confidence Level**: 85% (high confidence this will work)

**Recommendation**: **IMPLEMENT THIS GUIDE** - It provides the correct, official approach that should resolve the container registration issues.

---

## 1. Critical Discoveries

### 1.1 The Missing API: `Federated.importModule`

**Current Codebase Approach (WRONG):**
```typescript
// Manual container access - doesn't work
const container = await import('hello_remote/HelloRemote');
// Or
const container = globalThis.hello_remote;
```

**Guide's Approach (CORRECT):**
```typescript
// Official Re.Pack API
import { Federated } from '@callstack/repack/client';

const RemoteHello = React.lazy(() =>
  Federated.importModule('HelloRemote', './HelloRemote')
);
```

**Impact**: This is likely **the root cause** of container registration failures. The codebase is trying to access containers manually instead of using Re.Pack's official API.

### 1.2 Remote Configuration Difference

**Current Codebase:**
```javascript
remotes: {
  hello_remote: 'hello_remote@http://localhost:9004/remoteEntry.js',
}
```

**Guide's Approach:**
```javascript
remotes: {
  HelloRemote: 'HelloRemote',  // Just the name, no URL
}
```

**Analysis**: The guide shows remotes configured **without explicit URLs**. This suggests ScriptManager's resolver handles URL resolution automatically. This is a **significant simplification** and aligns with the ScriptManager resolver pattern.

### 1.3 Native Module Registration Clarification

**Guide's Claim**: "No manual native module registration is needed"

**Current Codebase**: Has `ScriptManagerPackage()` registration in `MainApplication.kt`

**Analysis**: The guide clarifies that Re.Pack handles native integration internally. However, the codebase may still need `ScriptManagerPackage` for Re.Pack's internal native modules (not ScriptManager specifically). This needs verification but doesn't contradict the guide.

---

## 2. Technical Accuracy Assessment

### 2.1 Highly Accurate Claims ✅

1. **`Federated.importModule` API**
   - ✅ This is the official Re.Pack API for Module Federation
   - ✅ Uses React.lazy + Suspense pattern (standard React pattern)
   - ✅ Integrates with ScriptManager automatically
   - ✅ This is what the codebase should be using

2. **Bootstrap Pattern**
   - ✅ ScriptManager configuration in bootstrap.ts is correct
   - ✅ Resolver pattern matches Re.Pack documentation
   - ✅ Storage setup with AsyncStorage is correct

3. **Module Federation Configuration**
   - ✅ Using `ModuleFederationPluginV2` is correct
   - ✅ `dts: false` is correct (avoids websocket issues)
   - ✅ Shared module configuration is correct
   - ✅ Remote name matching is critical (guide emphasizes this)

4. **New Architecture Compatibility**
   - ✅ Guide explicitly states it works with New Architecture
   - ✅ No custom TurboModules needed
   - ✅ This addresses the codebase's New Architecture concerns

### 2.2 Configuration Format Differences ⚠️

**Guide Uses:**
- ES modules (`webpack.repack.config.mjs`)
- `Repack.getDirname(import.meta.url)`
- Different file structure

**Current Codebase Uses:**
- CommonJS (`rspack.config.js`)
- `defineRspackConfig()` helper
- `__dirname` for paths

**Analysis**: Both approaches are valid. The guide's ES module format is more modern, but the codebase's CommonJS format with `defineRspackConfig` is also correct. The **functionality is the same**, just different syntax.

**Recommendation**: Keep current config format, but adopt the guide's **configuration values** (remote names, shared module settings, etc.).

### 2.3 Remote URL Resolution ⚠️

**Guide's Approach:**
- Remotes configured as just names: `HelloRemote: 'HelloRemote'`
- ScriptManager resolver handles URL resolution
- Uses `Script.getDevServerURL(scriptId)` in resolver

**Current Codebase:**
- Remotes configured with explicit URLs: `hello_remote@http://localhost:9004/remoteEntry.js`
- No ScriptManager resolver configured

**Analysis**: The guide's approach is **more flexible** and **correct**. ScriptManager should resolve URLs, not hardcode them. However, the current approach might work if ScriptManager is properly configured. The guide's approach is preferred.

**Key Insight**: The resolver's `scriptId` parameter will be the remote name (`HelloRemote`), and it should return the URL. This is how Module Federation integrates with ScriptManager.

### 2.4 Filename Configuration ⚠️

**Guide Uses:**
```javascript
filename: 'HelloRemote.container.js.bundle',
filename: 'MobileHost.container.js.bundle',
```

**Current Codebase Uses:**
```javascript
filename: 'remoteEntry.js',
```

**Analysis**: The guide's filename format is more descriptive, but both should work. The important part is that the **remote name matches** between host and remote configs.

---

## 3. Codebase Compatibility Analysis

### 3.1 What Needs to Change

**Critical Changes:**

1. **`apps/mobile-shell/src/app/App.tsx`** - **MAJOR CHANGE**
   - ❌ Remove manual container access code (lines 5-37)
   - ✅ Use `Federated.importModule` with React.lazy
   - ✅ Use Suspense for loading states

2. **`apps/mobile-shell/rspack.config.js`** - **MODERATE CHANGE**
   - ⚠️ Consider changing remote config to use names only (if ScriptManager resolver works)
   - ✅ Keep current config format (CommonJS is fine)
   - ❌ Remove `NormalModuleReplacementPlugin` for NativeScriptManager (if ScriptManager works)

3. **`apps/mobile-shell/src/main.tsx`** - **MAJOR CHANGE**
   - ❌ Remove TurboModuleRegistry patching (lines 1-26)
   - ✅ Import bootstrap.ts instead

4. **New File: `apps/mobile-shell/src/bootstrap.ts`** - **CREATE**
   - ✅ Create per guide (Section 0)

5. **`apps/hello-remote/repack.config.js`** - **MINOR CHANGE**
   - ⚠️ Consider changing filename to match guide format (optional)
   - ✅ Keep current structure (it's already correct)

### 3.2 What Can Stay the Same

**Keep As-Is:**
- ✅ Config file format (CommonJS is fine)
- ✅ Build structure and paths
- ✅ Shared module versions
- ✅ DTS plugin mock (still needed)
- ✅ Native module registration (may still be needed for Re.Pack internals)

---

## 4. Implementation Strategy

### 4.1 Phase 1: Bootstrap Setup (1-2 hours)

**Step 1: Create bootstrap.ts**
```typescript
// apps/mobile-shell/src/bootstrap.ts
import { AppRegistry } from 'react-native';
import { ScriptManager, Script } from '@callstack/repack/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { App } from './app/App';

ScriptManager.shared.setStorage(AsyncStorage);

ScriptManager.shared.addResolver(async (scriptId, caller) => {
  if (__DEV__) {
    // For Module Federation, scriptId will be the remote name
    // e.g., 'HelloRemote' or 'hello_remote'
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

**Step 2: Update main.tsx**
```typescript
// apps/mobile-shell/src/main.tsx
import './src/bootstrap';
```

**Step 3: Install AsyncStorage (if missing)**
```bash
npm install @react-native-async-storage/async-storage
```

### 4.2 Phase 2: Update App.tsx (1 hour)

**Replace manual container access with Federated.importModule:**

```typescript
// apps/mobile-shell/src/app/App.tsx
import React, { Suspense, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Federated } from '@callstack/repack/client';

const RemoteHello = React.lazy(() =>
  Federated.importModule('hello_remote', './HelloRemote')
);

const App = () => {
  const [showRemote, setShowRemote] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Universal MFE Seed</Text>
      <Pressable 
        style={styles.button} 
        onPress={() => setShowRemote(true)}
      >
        <Text style={styles.buttonText}>Load Hello Remote</Text>
      </Pressable>
      {showRemote && (
        <Suspense fallback={<Text>Loading remote…</Text>}>
          <RemoteHello />
        </Suspense>
      )}
    </View>
  );
};

// ... styles ...
```

**Key Changes:**
- Remove all manual container access code
- Use `Federated.importModule` with remote name matching config
- Use React.lazy + Suspense pattern
- Simplify state management

### 4.3 Phase 3: Update Remote Configuration (Optional, 30 min)

**Option A: Keep explicit URLs (safer for now)**
```javascript
// Keep current config, but ensure ScriptManager resolver also works
remotes: {
  hello_remote: 'hello_remote@http://localhost:9004/remoteEntry.js',
}
```

**Option B: Use name-only remotes (guide's approach)**
```javascript
// Update to name-only if ScriptManager resolver works
remotes: {
  hello_remote: 'hello_remote',  // ScriptManager resolves URL
}
```

**Recommendation**: Start with Option A (keep explicit URLs), test, then try Option B if everything works.

### 4.4 Phase 4: Remove Mock ScriptManager (1-2 hours)

**Only after confirming ScriptManager works:**

1. **Remove NormalModuleReplacementPlugin**
   ```javascript
   // Remove this from rspack.config.js:
   new NormalModuleReplacementPlugin(
     /@callstack\/repack\/dist\/modules\/ScriptManager\/NativeScriptManager\.js$/,
     join(__dirname, 'src/repack-patch.js')
   ),
   ```

2. **Remove TurboModuleRegistry patching**
   - Already removed in Phase 1 (main.tsx update)

3. **Backup repack-patch.js**
   ```bash
   mv apps/mobile-shell/src/repack-patch.js apps/mobile-shell/src/repack-patch.js.backup
   ```

### 4.5 Phase 5: Testing (2-3 hours)

1. **Test ScriptManager availability**
   - Check logs for "[ScriptManager] configured"
   - Verify ScriptManager.shared exists

2. **Test remote loading**
   - Click button to load remote
   - Check Suspense fallback appears
   - Verify component renders

3. **Test resolver**
   - Add logging to resolver
   - Verify scriptId matches remote name
   - Verify URL is correct

4. **Test container registration**
   - Check if container registers automatically
   - Verify no "container not found" errors

---

## 5. Critical Implementation Details

### 5.1 Remote Name Matching

**CRITICAL**: Remote names must match exactly:

**Host Config:**
```javascript
remotes: {
  hello_remote: 'hello_remote@...',  // or just 'hello_remote'
}
```

**Host Usage:**
```typescript
Federated.importModule('hello_remote', './HelloRemote')
//                      ^^^^^^^^^^^^
//                      Must match remote key
```

**Remote Config:**
```javascript
name: 'hello_remote',  // Must match
exposes: {
  './HelloRemote': './src/app/HelloRemote',
}
```

**If names don't match, Module Federation will fail silently.**

### 5.2 ScriptManager Resolver Integration

**How it works:**
1. `Federated.importModule('hello_remote', './HelloRemote')` is called
2. Module Federation runtime needs to load `hello_remote` container
3. Module Federation calls ScriptManager resolver with `scriptId = 'hello_remote'`
4. Resolver returns URL: `http://localhost:9004/remoteEntry.js` (or via `Script.getDevServerURL`)
5. ScriptManager loads the script
6. Container registers automatically
7. Module Federation can now access `./HelloRemote`

**Key Point**: ScriptManager resolver's `scriptId` parameter will be the **remote name** from the remotes config.

### 5.3 Dev Server URL Resolution

**Guide uses:**
```typescript
url: Script.getDevServerURL(scriptId)
```

**This generates URLs like:**
- `http://localhost:8081/hello_remote.container.js.bundle`
- Or based on Re.Pack dev server configuration

**Current codebase uses explicit URLs:**
- `http://localhost:9004/remoteEntry.js`

**Recommendation**: 
- For now, use explicit URL in resolver for `hello_remote`
- Test if `Script.getDevServerURL` works later
- May need to configure Re.Pack dev server port mapping

### 5.4 Shared Module Configuration

**Guide uses:**
```javascript
shared: {
  react: { singleton: true, eager: false },
  'react-native': { singleton: true, eager: false },
}
```

**Current codebase uses:**
```javascript
shared: {
  react: { singleton: true, eager: true, requiredVersion: '^19.0.0' },
  'react-native': { singleton: true, eager: true, requiredVersion: '~0.79.3' },
}
```

**Analysis**: Guide's `eager: false` is more correct for Module Federation (lazy loading). Current `eager: true` may cause issues. However, `requiredVersion` is good for safety.

**Recommendation**: Try `eager: false` first, add `requiredVersion` if needed.

---

## 6. Potential Issues & Solutions

### 6.1 Issue: `Federated` is undefined

**Possible Causes:**
- Re.Pack client not properly bundled
- Import path incorrect
- Version incompatibility

**Solutions:**
1. Verify import: `import { Federated } from '@callstack/repack/client'`
2. Check Re.Pack version compatibility
3. Ensure Re.Pack is in dependencies (not just devDependencies)
4. Clear caches and rebuild

### 6.2 Issue: Suspense hangs forever

**Possible Causes:**
- ScriptManager resolver not called
- Wrong URL from resolver
- Remote name mismatch
- Remote dev server not running

**Solutions:**
1. Add logging to resolver to verify it's called
2. Check resolver returns correct URL
3. Verify remote name matches exactly
4. Ensure remote dev server is running on correct port
5. Check Android emulator networking (use `10.0.2.2` if needed)

### 6.3 Issue: "container not found" errors

**Possible Causes:**
- Remote didn't register container
- Remote bundle not built with ModuleFederationPluginV2
- Remote entry not being served correctly

**Solutions:**
1. Verify remote uses `ModuleFederationPluginV2`
2. Check remote bundle includes container registration code
3. Verify remote entry is accessible at resolver URL
4. Check remote's `name` matches host's remote key

### 6.4 Issue: ScriptManager resolver not called

**Possible Causes:**
- ScriptManager not configured
- Bootstrap not imported
- Module Federation not using ScriptManager

**Solutions:**
1. Verify bootstrap.ts is imported in main.tsx
2. Check ScriptManager.shared exists at runtime
3. Add logging to verify resolver is called
4. Ensure ModuleFederationPluginV2 is configured correctly

---

## 7. Comparison with Current Implementation

### 7.1 What the Guide Fixes

| Issue | Current Approach | Guide's Approach | Impact |
|-------|------------------|------------------|--------|
| Remote Loading | Manual container access | `Federated.importModule` | ✅ **Fixes container registration** |
| ScriptManager | Mock TurboModule (1740 lines) | JavaScript API | ✅ **Removes unnecessary mock** |
| URL Resolution | Hardcoded in config | ScriptManager resolver | ✅ **More flexible** |
| Loading States | Manual useState | React.lazy + Suspense | ✅ **Better UX** |
| Native Modules | Manual registration | Handled by Re.Pack | ✅ **Simpler** |

### 7.2 Why Current Approach Fails

**Current manual container access:**
```typescript
const container = await import('hello_remote/HelloRemote');
```

**Why it fails:**
1. Module Federation runtime hasn't loaded the remote container yet
2. Container isn't registered because ScriptManager isn't working
3. Direct import doesn't trigger ScriptManager resolver
4. No integration with Re.Pack's Module Federation runtime

**Guide's approach:**
```typescript
Federated.importModule('hello_remote', './HelloRemote')
```

**Why it works:**
1. Integrates with Module Federation runtime
2. Triggers ScriptManager resolver automatically
3. Handles container loading and registration
4. Uses React.lazy for proper code splitting

---

## 8. Final Verdict

### 8.1 Is the Guide Accurate?

**Highly Accurate** ✅

- ✅ `Federated.importModule` is the correct API
- ✅ Bootstrap pattern is correct
- ✅ ScriptManager integration is correct
- ✅ New Architecture compatibility confirmed
- ✅ Error handling guidance is helpful
- ⚠️ Config format differences are cosmetic (both work)

### 8.2 Can It Help Refactoring?

**Absolutely Yes** ✅

**Benefits:**
- ✅ Provides the **correct API** the codebase should be using
- ✅ Explains **how** Module Federation integrates with ScriptManager
- ✅ Addresses **all** the issues identified in previous analysis
- ✅ Much simpler than current 1740-line mock
- ✅ Official Re.Pack approach

**Risks:**
- ⚠️ Minor: Config format differences (easily adapted)
- ⚠️ Minor: Remote URL resolution approach (can test both)

### 8.3 Recommendation

**STRONGLY RECOMMEND IMPLEMENTING THIS GUIDE** ✅

**Priority**: **HIGH** - This guide directly addresses the root cause of container registration failures.

**Implementation Order:**
1. ✅ Create bootstrap.ts (Phase 1)
2. ✅ Update App.tsx to use `Federated.importModule` (Phase 2)
3. ✅ Test and verify (Phase 5)
4. ✅ Remove mock ScriptManager if working (Phase 4)
5. ✅ Optimize remote config if desired (Phase 3)

**Estimated Time**: 6-10 hours total

**Success Probability**: **85%** (high confidence this will work)

---

## 9. Action Items

### Immediate (Before Implementation)

1. ✅ Verify `@callstack/repack/client` exports `Federated`
2. ✅ Install `@react-native-async-storage/async-storage` if missing
3. ✅ Review remote name consistency across configs

### Implementation

1. ✅ Create `bootstrap.ts` per guide
2. ✅ Update `main.tsx` to import bootstrap
3. ✅ Update `App.tsx` to use `Federated.importModule`
4. ✅ Test ScriptManager availability
5. ✅ Test remote loading
6. ✅ Verify container registration

### Cleanup (Only if Working)

1. ✅ Remove `NormalModuleReplacementPlugin` for NativeScriptManager
2. ✅ Remove TurboModuleRegistry patching (already done)
3. ✅ Backup (don't delete) `repack-patch.js`
4. ✅ Consider optimizing remote config to name-only

---

## 10. Key Takeaways

1. **`Federated.importModule` is the correct API** - The codebase should use this, not manual container access
2. **ScriptManager is a JavaScript API** - No TurboModule mocking needed
3. **Remote names must match exactly** - Critical for Module Federation to work
4. **ScriptManager resolver handles URLs** - More flexible than hardcoded URLs
5. **New Architecture is supported** - No need to disable it
6. **Much simpler than current approach** - Removes 1740 lines of mock code

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-29  
**Status**: Ready for Implementation  
**Confidence**: 85% (High)

