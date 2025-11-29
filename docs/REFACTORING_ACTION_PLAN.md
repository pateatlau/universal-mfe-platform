# Universal MFE Platform - Refactoring Action Plan

## Complete Implementation Guide Based on ScriptManager & Module Federation v2 Integration

**Date**: 2026-01-29  
**Version**: 1.0  
**Status**: Ready for Implementation  
**Estimated Total Time**: 12-18 hours  
**Success Probability**: 85%

---

## Executive Summary

This action plan provides a **step-by-step guide** to refactor the Universal MFE Platform's mobile implementation, replacing the 1740-line mock ScriptManager with the correct Re.Pack ScriptManager API and `Federated.importModule` approach.

**Key Changes:**

1. ✅ Replace mock ScriptManager with official ScriptManager JavaScript API
2. ✅ Replace manual container access with `Federated.importModule`
3. ✅ Create proper ScriptManager bootstrap configuration
4. ✅ Remove all TurboModule-related workarounds
5. ✅ Implement React.lazy + Suspense pattern for remote loading

**Expected Outcome**: Fully functional mobile Module Federation with proper container registration and remote component loading.

---

## Table of Contents

1. [Prerequisites & Preparation](#1-prerequisites--preparation)
2. [Phase 1: Verification & Setup](#2-phase-1-verification--setup)
3. [Phase 2: ScriptManager Bootstrap](#3-phase-2-scriptmanager-bootstrap)
4. [Phase 3: Update App Component](#4-phase-3-update-app-component)
5. [Phase 4: Remove Mock ScriptManager](#5-phase-4-remove-mock-scriptmanager)
6. [Phase 5: Configuration Updates](#6-phase-5-configuration-updates)
7. [Phase 6: Testing & Validation](#7-phase-6-testing--validation)
8. [Phase 7: Cleanup & Optimization](#8-phase-7-cleanup--optimization)
9. [Rollback Strategy](#9-rollback-strategy)
10. [Troubleshooting Guide](#10-troubleshooting-guide)

---

## 1. Prerequisites & Preparation

### 1.1 Required Dependencies

**Verify these are installed:**

```bash
# Check current versions
npm list @callstack/repack
npm list @react-native-async-storage/async-storage
npm list react
npm list react-native
```

**Install missing dependencies:**

```bash
# Check if AsyncStorage is already installed
npm list @react-native-async-storage/async-storage

# Install AsyncStorage if missing (as regular dependency)
npm install --save @react-native-async-storage/async-storage

# Note: AsyncStorage may require native linking in Nx monorepo
# Check if autolinking works, if not, may need manual registration similar to ScriptManagerPackage

# Ensure Re.Pack is in dependencies (not just devDependencies)
npm install --save @callstack/repack
```

### 1.2 Backup Current Implementation

**Create backup branch:**

```bash
git checkout -b backup/before-scriptmanager-refactor
git add .
git commit -m "Backup: Before ScriptManager refactoring"
git checkout develop  # or your working branch
```

**Backup critical files:**

```bash
# Backup mock ScriptManager (don't delete yet)
cp apps/mobile-shell/src/repack-patch.js apps/mobile-shell/src/repack-patch.js.backup

# Backup current App.tsx
cp apps/mobile-shell/src/app/App.tsx apps/mobile-shell/src/app/App.tsx.backup

# Backup current main.tsx
cp apps/mobile-shell/src/main.tsx apps/mobile-shell/src/main.tsx.backup

# Backup rspack config
cp apps/mobile-shell/rspack.config.js apps/mobile-shell/rspack.config.js.backup
```

### 1.3 Verify Current State

**Check current implementation:**

```bash
# Verify remote dev server is running
curl http://localhost:9004/remoteEntry.js

# Verify mobile shell dev server
curl http://localhost:8081/main.bundle

# Check Android emulator port forwarding
adb reverse --list
```

**Expected output:**

- Remote entry accessible at port 9004
- Mobile shell bundle accessible at port 8081
- Port forwarding configured (if needed)

---

## 2. Phase 1: Verification & Setup

**Time Estimate**: 1-2 hours  
**Risk Level**: Low  
**Prerequisites**: None

### 2.1 Verify ScriptManager API Availability

**Step 1: Check Re.Pack exports**

```bash
# Check if ScriptManager is exported
node -e "const { ScriptManager, Federated } = require('@callstack/repack/client'); console.log('ScriptManager:', typeof ScriptManager); console.log('Federated:', typeof Federated);"
```

**Expected output:**

```
ScriptManager: object
Federated: object
```

**If undefined:**

- Check Re.Pack version compatibility
- Verify `@callstack/repack` is properly installed
- Check if using correct import path

**Step 2: Verify TypeScript definitions**

```bash
# Find TypeScript definitions
find node_modules/@callstack/repack -name "*.d.ts" | xargs grep -l "ScriptManager\|Federated"
```

**Step 3: Test minimal import**

Create temporary test file:

```typescript
// apps/mobile-shell/src/test-imports.ts
import { ScriptManager, Federated, Script } from '@callstack/repack/client';

console.log('ScriptManager:', ScriptManager);
console.log('Federated:', Federated);
console.log('Script:', Script);
```

**Run test:**

```bash
npx ts-node apps/mobile-shell/src/test-imports.ts
```

**Expected**: No errors, objects logged

### 2.2 Verify Native Module Registration

**Check MainApplication.kt:**

```kotlin
// apps/mobile-shell/android/app/src/main/java/com/mobileshell/MainApplication.kt
// Should have:
import com.callstack.repack.ScriptManagerPackage

// In getPackages():
add(0, ScriptManagerPackage())
```

**Note**: Keep this registration. The guide says "no manual registration needed" but this may be for Re.Pack's internal native modules. We'll test if it's still needed.

### 2.3 Verify Remote Configuration

**Check remote name consistency:**

```bash
# In mobile-shell rspack.config.js
grep -A 5 "remotes:" apps/mobile-shell/rspack.config.js

# In hello-remote repack.config.js
grep -A 3 "name:" apps/hello-remote/repack.config.js
```

**Current state:**

- Host remote key: `hello_remote`
- Remote name: `hello_remote`
- Exposed path: `./HelloRemote`

**Action**: Ensure these match exactly (they should already match).

### 2.4 Verification Checklist

- [ ] ScriptManager API available from `@callstack/repack/client`
- [ ] Federated API available from `@callstack/repack/client`
- [ ] AsyncStorage installed
- [ ] Native module registration present (keep for now)
- [ ] Remote names match between host and remote configs
- [ ] Remote dev server accessible
- [ ] Mobile shell dev server accessible
- [ ] Backup files created

**If any check fails, resolve before proceeding.**

---

## 3. Phase 2: ScriptManager Bootstrap

**Time Estimate**: 1-2 hours  
**Risk Level**: Low  
**Prerequisites**: Phase 1 complete

### 3.1 Create Bootstrap File

**Create `apps/mobile-shell/src/bootstrap.ts`:**

```typescript
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
```

### 3.2 Update Entry File

**Update `apps/mobile-shell/src/main.tsx`:**

```typescript
// apps/mobile-shell/src/main.tsx
// Remove all TurboModuleRegistry patching - no longer needed
import './bootstrap'; // Note: bootstrap.ts is in same directory (src/)
```

**Remove:**

- All TurboModuleRegistry patching code (lines 1-26)
- Mock ScriptManager references

**Keep:**

- Just the bootstrap import

### 3.3 Test Bootstrap

**Step 1: Build and run**

```bash
# Start remote dev server
npm run hello-remote:serve:mobile

# In another terminal, start mobile shell
npm run mobile-shell:android
```

**Step 2: Check logs**

Look for these log messages:

```
[ScriptManager] configured with storage + resolver
[ScriptManager] ScriptManager.shared: [object Object]
```

**If ScriptManager.shared is undefined:**

- Check import path
- Verify Re.Pack is properly bundled
- Check if bootstrap is imported correctly

**Step 3: Verify app loads**

- App should load normally
- No errors about ScriptManager
- UI renders correctly

### 3.4 Phase 2 Checklist

- [ ] bootstrap.ts created with ScriptManager configuration
- [ ] main.tsx updated to import bootstrap only
- [ ] TurboModuleRegistry patching removed
- [ ] App loads without errors
- [ ] ScriptManager.shared is defined in logs
- [ ] Resolver logs appear when triggered

---

## 4. Phase 3: Update App Component

**Time Estimate**: 1-2 hours  
**Risk Level**: Medium  
**Prerequisites**: Phase 2 complete

### 4.1 Update App.tsx

**Replace `apps/mobile-shell/src/app/App.tsx`:**

```typescript
// apps/mobile-shell/src/app/App.tsx
import React, { Suspense, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Federated } from '@callstack/repack/client';

// Use Federated.importModule with React.lazy
// Remote name must match exactly with rspack.config.js remotes config
const RemoteHello = React.lazy(() =>
  Federated.importModule('hello_remote', './HelloRemote')
);

const App = () => {
  const [showRemote, setShowRemote] = useState(false);

  const handleLoadRemote = () => {
    console.log('[App] Loading remote component...');
    setShowRemote(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Universal MFE Seed</Text>
      <Pressable style={styles.button} onPress={handleLoadRemote}>
        <Text style={styles.buttonText}>Load Hello Remote</Text>
      </Pressable>

      {showRemote && (
        <Suspense
          fallback={<Text style={styles.loadingText}>Loading remote…</Text>}
        >
          <RemoteHello />
        </Suspense>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#000000',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 20,
  },
});

export default App;
```

### 4.2 Key Changes

**Removed:**

- ❌ Manual container access code (`loadRemoteComponent` function)
- ❌ Manual `useState` for loading/error states
- ❌ Try-catch error handling (Suspense handles this)
- ❌ Direct `import()` calls
- ❌ `globalThis` container checks

**Added:**

- ✅ `Federated.importModule` import
- ✅ React.lazy with `Federated.importModule`
- ✅ Suspense for loading states
- ✅ Simplified state management

### 4.3 Verify Remote Name Matching

**Critical**: Remote name must match exactly

**In `apps/mobile-shell/rspack.config.js`:**

```javascript
remotes: {
  hello_remote: 'hello_remote@http://localhost:9004/remoteEntry.js',
}
```

**In `apps/mobile-shell/src/app/App.tsx`:**

```typescript
Federated.importModule('hello_remote', './HelloRemote');
//                      ^^^^^^^^^^^^
//                      Must match remote key above
```

**In `apps/hello-remote/repack.config.js`:**

```javascript
name: 'hello_remote',  // Must match
exposes: {
  './HelloRemote': './src/app/HelloRemote',
}
```

### 4.4 Test App Update

**Step 1: Build and run**

```bash
# Ensure remote dev server is running
npm run hello-remote:serve:mobile

# Start mobile shell
npm run mobile-shell:android
```

**Step 2: Test remote loading**

1. Click "Load Hello Remote" button
2. Check logs for:
   - `[ScriptManager] Resolving script: hello_remote`
   - `[App] Loading remote component...`
   - Suspense fallback should appear
   - Remote component should load

**Step 3: Check for errors**

- No "container not found" errors
- No "ScriptManager is undefined" errors
- No "Federated is undefined" errors

### 4.5 Phase 3 Checklist

- [ ] App.tsx updated to use `Federated.importModule`
- [ ] React.lazy + Suspense pattern implemented
- [ ] Remote name matches exactly in all configs
- [ ] Manual container access code removed
- [ ] App builds without errors
- [ ] Button click triggers remote loading
- [ ] Suspense fallback appears
- [ ] Remote component loads (or shows clear error)

---

## 5. Phase 4: Remove Mock ScriptManager

**Time Estimate**: 1-2 hours  
**Risk Level**: High (but reversible)  
**Prerequisites**: Phases 2 & 3 complete, remote loading works

### 5.1 Remove NormalModuleReplacementPlugin

**Update `apps/mobile-shell/rspack.config.js`:**

**Remove this plugin:**

```javascript
// REMOVE THIS:
new NormalModuleReplacementPlugin(
  /@callstack\/repack\/dist\/modules\/ScriptManager\/NativeScriptManager\.js$/,
  join(__dirname, 'src/repack-patch.js')
),
```

**Keep:**

- DTS plugin mock (still needed)
- ModuleFederationPluginV2
- All other plugins

### 5.2 Backup Mock File

**Don't delete yet - just rename:**

```bash
# Rename instead of delete
mv apps/mobile-shell/src/repack-patch.js apps/mobile-shell/src/repack-patch.js.backup
```

### 5.3 Remove Test Import File

**If created in Phase 1:**

```bash
rm apps/mobile-shell/src/test-imports.ts
```

### 5.4 Test After Removal

**Step 1: Clean build**

```bash
# Clear caches
npm run nx:reset

# Rebuild
npm run mobile-shell:android
```

**Step 2: Verify functionality**

- App loads normally
- ScriptManager works
- Remote loading still works
- No errors about missing NativeScriptManager

**Step 3: Check logs**

- No references to mock ScriptManager
- ScriptManager resolver logs appear
- Container registration works

### 5.5 Phase 4 Checklist

- [ ] NormalModuleReplacementPlugin removed from rspack.config.js
- [ ] repack-patch.js renamed to .backup (not deleted)
- [ ] App builds without errors
- [ ] Remote loading still works
- [ ] No mock ScriptManager references in logs
- [ ] ScriptManager resolver works correctly

---

## 6. Phase 5: Configuration Updates

**Time Estimate**: 1-2 hours  
**Risk Level**: Low  
**Prerequisites**: Phase 4 complete

### 6.1 Optimize Remote Configuration (Optional)

**Current (explicit URL):**

```javascript
remotes: {
  hello_remote: 'hello_remote@http://localhost:9004/remoteEntry.js',
}
```

**Option A: Keep explicit URL (safer)**

- Keep current config
- ScriptManager resolver handles URL adjustment for Android

**Option B: Use name-only (guide's approach)**

```javascript
remotes: {
  hello_remote: 'hello_remote',  // ScriptManager resolves URL
}
```

**Recommendation**: Start with Option A, test thoroughly, then try Option B if desired.

### 6.2 Update Shared Module Configuration

**Current:**

```javascript
shared: {
  react: { singleton: true, eager: true, requiredVersion: '^19.0.0' },
  'react-native': { singleton: true, eager: true, requiredVersion: '~0.79.3' },
}
```

**Guide recommends:**

```javascript
shared: {
  react: { singleton: true, eager: false },
  'react-native': { singleton: true, eager: false },
}
```

**Recommendation**: Try `eager: false` first (better for Module Federation), add `requiredVersion` if needed.

### 6.3 Verify Native Module Registration

**Test if ScriptManagerPackage is still needed:**

**Option 1: Keep it (safe)**

- Keep current `MainApplication.kt` registration
- No changes needed

**Option 2: Test without it**

- Comment out `ScriptManagerPackage()` registration
- Test if ScriptManager still works
- If it works, remove it; if not, keep it

**Recommendation**: Keep it for now (safe approach).

### 6.4 Phase 5 Checklist

- [ ] Remote configuration optimized (or kept as-is)
- [ ] Shared module configuration updated (optional)
- [ ] Native module registration verified
- [ ] All configs consistent
- [ ] No breaking changes

---

## 7. Phase 6: Testing & Validation

**Time Estimate**: 2-3 hours  
**Risk Level**: Low  
**Prerequisites**: All previous phases complete

### 7.1 Functional Testing

**Test 1: App Launch**

- [ ] App launches without errors
- [ ] UI renders correctly
- [ ] No ScriptManager errors in logs

**Test 2: ScriptManager Bootstrap**

- [ ] ScriptManager.shared is defined
- [ ] Resolver is configured
- [ ] Storage is configured

**Test 3: Remote Loading**

- [ ] Click button triggers remote load
- [ ] Suspense fallback appears
- [ ] Remote component loads successfully
- [ ] Remote component renders correctly

**Test 4: Container Registration**

- [ ] Container registers automatically
- [ ] No "container not found" errors
- [ ] Module Federation runtime initializes

**Test 5: Error Handling**

- [ ] Network errors handled gracefully
- [ ] Suspense shows loading state
- [ ] Errors don't crash app

### 7.2 Integration Testing

**Test 6: Multiple Remote Loads**

- [ ] Load remote multiple times
- [ ] No duplicate registrations
- [ ] Performance is acceptable

**Test 7: Dev Server Restart**

- [ ] Restart remote dev server
- [ ] Reload app
- [ ] Remote still loads correctly

**Test 8: Network Scenarios**

- [ ] Test with Android emulator (10.0.2.2)
- [ ] Test with iOS simulator (localhost)
- [ ] Test with physical device
- [ ] Test with network disconnected (error handling)

### 7.3 Performance Testing

**Test 9: Bundle Size**

- [ ] Check bundle size hasn't increased significantly
- [ ] Mock ScriptManager code removed from bundle

**Test 10: Load Time**

- [ ] Remote loads within acceptable time
- [ ] No significant performance regression

### 7.4 Validation Checklist

- [ ] All functional tests pass
- [ ] All integration tests pass
- [ ] Performance is acceptable
- [ ] No regressions introduced
- [ ] Error handling works correctly
- [ ] Works on Android
- [ ] Works on iOS (if applicable)

---

## 8. Phase 7: Cleanup & Optimization

**Time Estimate**: 1-2 hours  
**Risk Level**: Low  
**Prerequisites**: Phase 6 complete, all tests pass

### 8.1 Remove Backup Files

**Only after confirming everything works:**

```bash
# Remove backup files
rm apps/mobile-shell/src/repack-patch.js.backup
rm apps/mobile-shell/src/app/App.tsx.backup
rm apps/mobile-shell/src/main.tsx.backup
rm apps/mobile-shell/rspack.config.js.backup
```

**Or keep them for reference:**

- Keep backups in `.backup` files for now
- Remove later after extended testing

### 8.2 Code Cleanup

**Remove unused imports:**

- Check for unused imports in App.tsx
- Remove any compatibility layer code that's no longer needed

**Update comments:**

- Remove outdated comments about mock ScriptManager
- Add comments explaining ScriptManager bootstrap
- Document Federated.importModule usage

### 8.3 Documentation Updates

**Update README.md:**

- Document ScriptManager setup
- Document Federated.importModule usage
- Update troubleshooting section

**Update IMPLEMENTATION_ANALYSIS.md:**

- Mark ScriptManager issue as resolved
- Update status indicators
- Document new approach

### 8.4 Final Optimization

**Optimize ScriptManager resolver:**

- Remove debug logging if desired
- Optimize URL resolution logic
- Consider caching strategies

**Optimize remote config:**

- Try name-only remotes if explicit URLs work
- Optimize shared module configuration

### 8.5 Phase 7 Checklist

- [ ] Backup files removed (or kept for reference)
- [ ] Unused code removed
- [ ] Comments updated
- [ ] Documentation updated
- [ ] Code optimized
- [ ] Final review complete

---

## 9. Rollback Strategy

### 9.1 If Phase 2 Fails (Bootstrap)

**Rollback:**

```bash
# Restore main.tsx
cp apps/mobile-shell/src/main.tsx.backup apps/mobile-shell/src/main.tsx

# Remove bootstrap.ts
rm apps/mobile-shell/src/bootstrap.ts
```

**Investigate:**

- Check ScriptManager API availability
- Verify Re.Pack version compatibility
- Check import paths

### 9.2 If Phase 3 Fails (App Update)

**Rollback:**

```bash
# Restore App.tsx
cp apps/mobile-shell/src/app/App.tsx.backup apps/mobile-shell/src/app/App.tsx
```

**Investigate:**

- Check Federated API availability
- Verify remote name matching
- Check Module Federation configuration

### 9.3 If Phase 4 Fails (Remove Mock)

**Rollback:**

```bash
# Restore repack-patch.js
mv apps/mobile-shell/src/repack-patch.js.backup apps/mobile-shell/src/repack-patch.js

# Restore rspack.config.js
cp apps/mobile-shell/rspack.config.js.backup apps/mobile-shell/rspack.config.js

# Restore NormalModuleReplacementPlugin
# (manually edit rspack.config.js)
```

**Investigate:**

- Check if ScriptManager is actually working
- Verify native module registration
- Check for other dependencies on mock

### 9.4 Complete Rollback

**If everything fails:**

```bash
# Restore from git backup branch
git checkout backup/before-scriptmanager-refactor

# Or restore individual files
git checkout backup/before-scriptmanager-refactor -- apps/mobile-shell/
```

---

## 10. Troubleshooting Guide

### 10.1 ScriptManager.shared is undefined

**Symptoms:**

- `ScriptManager.shared` is undefined
- Bootstrap logs show error

**Solutions:**

1. Verify import path: `import { ScriptManager } from '@callstack/repack/client'`
2. Check Re.Pack version: `npm list @callstack/repack`
3. Verify Re.Pack is in dependencies (not just devDependencies)
4. Clear caches and rebuild: `npm run nx:reset`
5. Check if bootstrap is imported in main.tsx

### 10.2 Federated is undefined

**Symptoms:**

- `Federated.importModule` fails
- Import error

**Solutions:**

1. Verify import: `import { Federated } from '@callstack/repack/client'`
2. Check Re.Pack version compatibility
3. Verify ModuleFederationPluginV2 is configured
4. Clear caches and rebuild

### 10.3 Remote never loads (Suspense hangs)

**Symptoms:**

- Suspense fallback appears but never resolves
- No error messages

**Solutions:**

1. Check ScriptManager resolver is called (add logging)
2. Verify remote dev server is running
3. Check URL resolution (Android emulator needs 10.0.2.2)
4. Verify remote name matches exactly
5. Check network connectivity
6. Verify remote entry is accessible

### 10.4 Container not found errors

**Symptoms:**

- "container not found" errors
- Remote script loads but container doesn't register

**Solutions:**

1. Verify remote uses ModuleFederationPluginV2
2. Check remote's `name` matches host's remote key
3. Verify remote entry includes container registration
4. Check Module Federation runtime initialization
5. Verify shared module versions match

### 10.5 Network errors (404, connection refused)

**Symptoms:**

- 404 errors when loading remote
- Connection refused errors

**Solutions:**

1. **Android emulator**: Use `10.0.2.2` instead of `localhost`
2. **iOS simulator**: Use `localhost`
3. Verify port forwarding: `adb reverse tcp:9004 tcp:9004`
4. Check dev server is running and accessible
5. Verify dev server binds to `0.0.0.0` (not just `localhost`)

### 10.6 Build errors

**Symptoms:**

- TypeScript errors
- Build failures

**Solutions:**

1. Verify all imports are correct
2. Check TypeScript definitions for Re.Pack
3. Clear caches: `npm run nx:reset`
4. Reinstall dependencies: `rm -rf node_modules && npm install`
5. Check for syntax errors in new code

---

## 11. Success Criteria

### 11.1 Primary Success Criteria

- [ ] ✅ ScriptManager bootstrap works (ScriptManager.shared is defined)
- [ ] ✅ Remote component loads using `Federated.importModule`
- [ ] ✅ Container registers automatically
- [ ] ✅ No mock ScriptManager code in bundle
- [ ] ✅ No TurboModule-related workarounds
- [ ] ✅ App works on Android
- [ ] ✅ App works on iOS (if applicable)

### 11.2 Secondary Success Criteria

- [ ] ✅ Performance is acceptable
- [ ] ✅ Error handling works correctly
- [ ] ✅ Code is maintainable
- [ ] ✅ Documentation is updated
- [ ] ✅ No regressions in web shell

---

## 12. Timeline & Milestones

### Week 1: Implementation

**Day 1-2: Phases 1-2 (Verification & Bootstrap)**

- Verify APIs available
- Create bootstrap.ts
- Update main.tsx
- Test ScriptManager configuration

**Day 3-4: Phases 3-4 (App Update & Mock Removal)**

- Update App.tsx
- Remove mock ScriptManager
- Test remote loading

**Day 5: Phases 5-6 (Configuration & Testing)**

- Optimize configurations
- Comprehensive testing
- Fix any issues

### Week 2: Validation & Cleanup

**Day 1-2: Extended Testing**

- Test on multiple devices
- Test edge cases
- Performance testing

**Day 3-4: Cleanup & Documentation**

- Remove backup files
- Update documentation
- Code cleanup

**Day 5: Final Review**

- Code review
- Final testing
- Sign-off

---

## 13. Risk Assessment

### 13.1 High Risk Items

1. **Removing mock ScriptManager** (Phase 4)

   - **Risk**: App may break if ScriptManager doesn't work
   - **Mitigation**: Keep backup, test thoroughly before removal

2. **Changing App.tsx** (Phase 3)
   - **Risk**: Remote loading may fail
   - **Mitigation**: Keep backup, test incrementally

### 13.2 Medium Risk Items

1. **Bootstrap configuration** (Phase 2)

   - **Risk**: ScriptManager may not configure correctly
   - **Mitigation**: Test ScriptManager availability first

2. **Remote name matching** (Phase 3)
   - **Risk**: Names may not match exactly
   - **Mitigation**: Verify names in all configs

### 13.3 Low Risk Items

1. **Configuration updates** (Phase 5)

   - **Risk**: Minor config changes
   - **Mitigation**: Test after each change

2. **Cleanup** (Phase 7)
   - **Risk**: Removing backup files
   - **Mitigation**: Keep backups until extended testing complete

---

## 14. Post-Implementation

### 14.1 Monitoring

**Watch for:**

- Remote loading failures
- Performance issues
- Error rates
- User reports

### 14.2 Future Optimizations

**Consider:**

- Name-only remote configuration
- Caching strategies
- Performance optimizations
- Additional remote MFEs

### 14.3 Knowledge Sharing

**Document:**

- ScriptManager setup process
- Federated.importModule usage
- Troubleshooting steps
- Lessons learned

---

## 15. Conclusion

This refactoring plan provides a **systematic approach** to replacing the mock ScriptManager with the official Re.Pack API. By following these phases incrementally and testing at each step, we can safely refactor the codebase while maintaining the ability to rollback if needed.

**Key Success Factors:**

1. ✅ Incremental implementation with testing at each phase
2. ✅ Comprehensive backups and rollback strategy
3. ✅ Clear verification checkpoints
4. ✅ Detailed troubleshooting guide

**Expected Outcome:**

- Fully functional mobile Module Federation
- Cleaner, more maintainable codebase
- Official Re.Pack API usage
- No mock ScriptManager dependencies

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-29  
**Status**: Ready for Implementation  
**Next Review**: After Phase 2 completion
