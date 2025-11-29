# Manual Testing Instructions - ScriptManager Refactoring
## Complete Step-by-Step Testing Guide

**Date**: 2026-01-29  
**Status**: Ready for Manual Testing  
**Prerequisites**: Automated tests passed ✅

---

## Pre-Testing Setup

### Step 1: Verify Prerequisites

**Check Remote Dev Server**:
```bash
# Should return HTTP 200 and JavaScript bundle
curl http://localhost:9004/remoteEntry.js | head -5
```

**Expected**: JavaScript bundle content (webpack/Module Federation code)

**If not running**, start it:
```bash
npm run hello-remote:serve:mobile
```

**Wait for**: Server to start and show "Compiled successfully" or similar message

---

### Step 2: Set Up Android Emulator Port Forwarding

**For Android Emulator** (required):
```bash
npm run adb:reverse
```

**Expected Output**:
```
✓ Port forwarding set up (8081 and 9004)
```

**Verify**:
```bash
adb reverse --list
```

**Expected**: Should show:
```
tcp:8081 tcp:8081
tcp:9004 tcp:9004
```

**Note**: If using iOS Simulator, port forwarding is not needed (uses localhost directly).

---

### Step 3: Prepare Testing Environment

**Clear Previous Builds** (optional but recommended):
```bash
# Clear Nx cache
npm run nx:reset

# Clear React Native cache (if needed)
cd apps/mobile-shell/android
./gradlew clean
cd ../../..
```

---

## Testing Procedure

### Test 1: App Launch ✅

**Objective**: Verify app launches without errors and ScriptManager bootstrap works

**Steps**:
1. Start mobile shell:
   ```bash
   npm run mobile-shell:android
   ```
2. Wait for app to build and launch on emulator/device
3. Observe the app screen
4. Check logs/console (logcat for Android, Xcode console for iOS)

**Expected Results**:
- [ ] App launches successfully
- [ ] No red screen errors
- [ ] UI renders correctly
- [ ] "Universal MFE Seed" title visible
- [ ] "Load Hello Remote" button visible
- [ ] No crash errors

**Logs to Verify**:
Look for these messages in console/logcat:
```
[ScriptManager] configured with storage + resolver
[ScriptManager] ScriptManager.shared: [object Object]
```

**Success Criteria**:
- ✅ App launches without errors
- ✅ ScriptManager bootstrap logs appear
- ✅ ScriptManager.shared is defined (not undefined)

**If ScriptManager.shared is undefined**:
- Check import: `import { ScriptManager } from '@callstack/repack/client'`
- Verify Re.Pack is in dependencies: `npm list @callstack/repack`
- Check if bootstrap is imported: Verify `main.tsx` imports `'./bootstrap'`
- Clear caches and rebuild: `npm run nx:reset`

---

### Test 2: ScriptManager Bootstrap Verification ✅

**Objective**: Verify ScriptManager is properly configured and available

**Steps**:
1. After app launches, check console/logcat
2. Look for ScriptManager configuration messages
3. Verify no errors about ScriptManager or AsyncStorage

**Expected Logs**:
```
[ScriptManager] configured with storage + resolver
[ScriptManager] ScriptManager.shared: [object Object]
```

**Success Criteria**:
- [ ] ScriptManager configuration message appears
- [ ] ScriptManager.shared is defined
- [ ] No errors about AsyncStorage
- [ ] No errors about ScriptManager import

**If Errors Occur**:
- **AsyncStorage error**: May need native linking in Nx monorepo
  - Check if AsyncStorage autolinking works
  - If not, may need to add to MainApplication.kt (similar to ScriptManagerPackage)
- **ScriptManager undefined**: See troubleshooting in Test 1

---

### Test 3: Remote Component Loading ✅

**Objective**: Verify remote component loads using Federated.importModule

**Steps**:
1. Click the "Load Hello Remote" button
2. Observe the loading state
3. Wait for remote component to appear
4. Check console/logcat for loading messages

**Expected Behavior**:
- [ ] Button click triggers remote load
- [ ] "Loading remote…" text appears (Suspense fallback)
- [ ] Remote component loads successfully
- [ ] Remote component renders correctly
- [ ] "Hello from Remote MFE!" text visible
- [ ] Greeting message from shared utils visible

**Expected Logs**:
```
[App] Loading remote component...
[ScriptManager] Resolving script: hello_remote from caller: ...
[ScriptManager] Using explicit URL: http://10.0.2.2:9004/remoteEntry.js
```

**Success Criteria**:
- ✅ Suspense fallback appears
- ✅ Remote component loads
- ✅ Remote component renders
- ✅ No "container not found" errors
- ✅ No network errors

**If Suspense Hangs Forever**:
1. **Check ScriptManager Resolver**:
   - Verify resolver is called (should see log: `[ScriptManager] Resolving script: hello_remote`)
   - If not called, check Module Federation configuration

2. **Check Remote Dev Server**:
   ```bash
   curl http://localhost:9004/remoteEntry.js
   # Should return JavaScript bundle
   ```

3. **Check Network Configuration**:
   - **Android emulator**: Should use `10.0.2.2` (automatic via resolver)
   - **iOS simulator**: Should use `localhost` (automatic via resolver)
   - Verify port forwarding: `adb reverse --list`

4. **Check Remote Name**:
   - Verify remote name matches exactly: `'hello_remote'`
   - Check host config: `grep "hello_remote" apps/mobile-shell/rspack.config.js`
   - Check remote config: `grep "name:" apps/hello-remote/repack.config.js`

5. **Check Module Federation Runtime**:
   - Verify ModuleFederationPluginV2 is configured
   - Check if container registration is working

**Debug Steps**:
Add more logging to bootstrap.ts resolver:
```typescript
ScriptManager.shared.addResolver(async (scriptId, caller) => {
  console.log('[DEBUG] Resolver called:', { scriptId, caller, timestamp: Date.now() });
  // ... rest of resolver
});
```

---

### Test 4: Container Registration Verification ✅

**Objective**: Verify Module Federation container registers automatically

**Steps**:
1. After remote loads successfully, check logs
2. Verify no container registration errors
3. Test loading remote multiple times

**Expected Results**:
- [ ] Container registers automatically
- [ ] No "container not found" errors
- [ ] Module Federation runtime initializes
- [ ] Remote component is accessible
- [ ] Multiple loads work correctly

**Success Criteria**:
- ✅ No container registration errors
- ✅ Remote component accessible after load
- ✅ Can load remote multiple times

**If Container Registration Fails**:
1. Verify remote uses ModuleFederationPluginV2
2. Check remote's `name` matches host's remote key exactly
3. Verify remote entry includes container registration code
4. Check Module Federation runtime initialization
5. Verify shared module versions match

---

### Test 5: Error Handling ✅

**Objective**: Verify error handling works correctly

**Steps**:
1. Test with network disconnected (optional)
2. Test with remote server stopped (optional)
3. Test with invalid remote name (optional)

**Expected Results**:
- [ ] Network errors handled gracefully
- [ ] Suspense shows loading state
- [ ] Errors don't crash app
- [ ] Appropriate error messages shown

**Note**: These are optional tests. Focus on happy path first.

---

### Test 6: Performance & Multiple Loads ✅

**Objective**: Verify performance and multiple remote loads

**Steps**:
1. Load remote component
2. Wait for it to render
3. Click button again to reload
4. Observe performance

**Expected Results**:
- [ ] Remote loads within acceptable time (< 5 seconds)
- [ ] Multiple loads work correctly
- [ ] No duplicate registrations
- [ ] Performance is acceptable
- [ ] No memory leaks

---

### Test 7: Platform-Specific Testing ✅

**Test on Android Emulator**:
- [ ] Uses `10.0.2.2` for localhost (automatic)
- [ ] Remote loads successfully
- [ ] No 404 errors
- [ ] Port forwarding works

**Test on iOS Simulator**:
- [ ] Uses `localhost` (automatic)
- [ ] Remote loads successfully
- [ ] No 404 errors

**Test on Physical Device** (if available):
- [ ] Uses device's network IP
- [ ] Remote loads successfully
- [ ] Network configuration works

---

## Troubleshooting Guide

### Issue: ScriptManager.shared is undefined

**Symptoms**:
- Logs show ScriptManager.shared is undefined
- Bootstrap fails
- App may crash or show errors

**Solutions**:
1. **Verify Import**:
   ```typescript
   // In bootstrap.ts
   import { ScriptManager } from '@callstack/repack/client';
   ```

2. **Check Re.Pack Installation**:
   ```bash
   npm list @callstack/repack
   # Should show @callstack/repack@5.2.2
   ```

3. **Verify Re.Pack is in Dependencies**:
   ```bash
   grep "@callstack/repack" package.json
   # Should be in "dependencies", not "devDependencies"
   ```

4. **Clear Caches**:
   ```bash
   npm run nx:reset
   ```

5. **Check Bootstrap Import**:
   ```typescript
   // In main.tsx
   import './bootstrap';
   ```

6. **Rebuild**:
   ```bash
   npm run mobile-shell:android
   ```

---

### Issue: Federated is undefined

**Symptoms**:
- `Federated.importModule` fails
- Import error in App.tsx
- TypeScript/build error

**Solutions**:
1. **Verify Import**:
   ```typescript
   // In App.tsx
   import { Federated } from '@callstack/repack/client';
   ```

2. **Check Re.Pack Version**:
   ```bash
   npm list @callstack/repack
   ```

3. **Verify ModuleFederationPluginV2**:
   - Check rspack.config.js has ModuleFederationPluginV2 configured

4. **Clear Caches and Rebuild**:
   ```bash
   npm run nx:reset
   npm run mobile-shell:android
   ```

---

### Issue: Remote Never Loads (Suspense Hangs)

**Symptoms**:
- Suspense fallback appears
- Never resolves to show component
- No error messages

**Debugging Steps**:

1. **Check ScriptManager Resolver is Called**:
   - Look for log: `[ScriptManager] Resolving script: hello_remote`
   - If not appearing, resolver may not be triggered

2. **Verify Remote Dev Server**:
   ```bash
   curl http://localhost:9004/remoteEntry.js
   # Should return JavaScript bundle
   ```

3. **Check Network Configuration**:
   - **Android**: Should use `10.0.2.2` (check resolver logs)
   - **iOS**: Should use `localhost` (check resolver logs)
   - Verify port forwarding: `adb reverse --list`

4. **Verify Remote Name**:
   - Must match exactly: `'hello_remote'`
   - Check all configs use same name

5. **Add Debug Logging**:
   ```typescript
   // In bootstrap.ts resolver
   ScriptManager.shared.addResolver(async (scriptId, caller) => {
     console.log('[DEBUG] Resolver called:', { scriptId, caller });
     console.log('[DEBUG] Platform:', require('react-native').Platform.OS);
     // ... rest of resolver
   });
   ```

6. **Check Module Federation Runtime**:
   - Verify ModuleFederationPluginV2 is configured
   - Check if container registration is working

---

### Issue: Container Not Found Errors

**Symptoms**:
- "container not found" errors
- Remote script loads but container doesn't register
- Module Federation runtime errors

**Solutions**:
1. **Verify Remote Configuration**:
   - Remote must use `ModuleFederationPluginV2`
   - Check remote's `name` matches host's remote key exactly

2. **Check Remote Entry**:
   - Verify remote entry includes container registration
   - Check if remote bundle is built correctly

3. **Verify Shared Modules**:
   - Check shared module versions match
   - Verify `singleton: true` is set

4. **Check Module Federation Runtime**:
   - Verify runtime initializes correctly
   - Check for initialization errors

---

### Issue: Network Errors (404, Connection Refused)

**Symptoms**:
- 404 errors when loading remote
- Connection refused errors
- Network timeout

**Solutions**:

1. **Android Emulator**:
   - Verify resolver uses `10.0.2.2` (automatic via platform detection)
   - Check port forwarding: `adb reverse tcp:9004 tcp:9004`
   - Verify dev server binds to `0.0.0.0` (not just `localhost`)

2. **iOS Simulator**:
   - Verify resolver uses `localhost` (automatic)
   - Check dev server is accessible

3. **Physical Device**:
   - Use device's network IP address
   - Update resolver to use device IP instead of localhost

4. **Verify Dev Server**:
   ```bash
   # Should return JavaScript bundle
   curl http://localhost:9004/remoteEntry.js
   
   # For Android emulator
   curl http://10.0.2.2:9004/remoteEntry.js
   ```

5. **Check Dev Server Configuration**:
   - Verify dev server binds to `0.0.0.0`
   - Check firewall settings
   - Verify port 9004 is not blocked

---

### Issue: Build Errors

**Symptoms**:
- TypeScript errors
- Build failures
- Compilation errors

**Solutions**:
1. **Verify All Imports**:
   - Check import paths are correct
   - Verify all imports resolve

2. **Check TypeScript Definitions**:
   - Verify Re.Pack types are available
   - Check TypeScript version compatibility

3. **Clear Caches**:
   ```bash
   npm run nx:reset
   ```

4. **Reinstall Dependencies**:
   ```bash
   rm -rf node_modules
   npm install
   ```

5. **Check for Syntax Errors**:
   - Review new code for syntax issues
   - Verify all brackets/braces match

---

## Testing Checklist

### Pre-Testing ✅

- [ ] Remote dev server running (port 9004)
- [ ] Port forwarding set up (Android: `adb reverse`)
- [ ] Caches cleared (optional)
- [ ] Emulator/device ready

### Test Execution ✅

- [ ] **Test 1**: App Launch
  - [ ] App launches without errors
  - [ ] ScriptManager bootstrap logs appear
  - [ ] UI renders correctly

- [ ] **Test 2**: ScriptManager Bootstrap
  - [ ] ScriptManager.shared is defined
  - [ ] Resolver is configured
  - [ ] Storage is configured

- [ ] **Test 3**: Remote Loading
  - [ ] Button click triggers load
  - [ ] Suspense fallback appears
  - [ ] Remote component loads
  - [ ] Remote component renders

- [ ] **Test 4**: Container Registration
  - [ ] Container registers automatically
  - [ ] No "container not found" errors
  - [ ] Module Federation runtime initializes

- [ ] **Test 5**: Error Handling (optional)
  - [ ] Network errors handled gracefully
  - [ ] Errors don't crash app

- [ ] **Test 6**: Performance
  - [ ] Remote loads within acceptable time
  - [ ] Multiple loads work correctly
  - [ ] No performance regressions

- [ ] **Test 7**: Platform Testing
  - [ ] Works on Android
  - [ ] Works on iOS (if applicable)

---

## Success Criteria

### Primary Success Criteria ✅

- [ ] ✅ ScriptManager bootstrap works (ScriptManager.shared is defined)
- [ ] ✅ Remote component loads using `Federated.importModule`
- [ ] ✅ Container registers automatically
- [ ] ✅ No mock ScriptManager code in bundle
- [ ] ✅ No TurboModule-related workarounds
- [ ] ✅ App works on Android
- [ ] ✅ App works on iOS (if applicable)

### Secondary Success Criteria ✅

- [ ] ✅ Performance is acceptable
- [ ] ✅ Error handling works correctly
- [ ] ✅ Code is maintainable
- [ ] ✅ No regressions in web shell

---

## Testing Log Template

Use this template to document your testing:

```
=== Testing Log ===
Date: [DATE]
Tester: [NAME]
Platform: [Android/iOS]
Device: [Emulator/Physical Device]
Remote Server: [Running/Stopped]

Test 1: App Launch
Status: [PASS/FAIL]
Notes: [ANY ISSUES OR OBSERVATIONS]
Logs: [KEY LOG MESSAGES]

Test 2: ScriptManager Bootstrap
Status: [PASS/FAIL]
Notes: [ANY ISSUES OR OBSERVATIONS]
Logs: [KEY LOG MESSAGES]

Test 3: Remote Loading
Status: [PASS/FAIL]
Notes: [ANY ISSUES OR OBSERVATIONS]
Logs: [KEY LOG MESSAGES]

Test 4: Container Registration
Status: [PASS/FAIL]
Notes: [ANY ISSUES OR OBSERVATIONS]
Logs: [KEY LOG MESSAGES]

Overall Result: [PASS/FAIL]
Issues Found: [LIST ANY ISSUES]
Next Steps: [WHAT TO DO NEXT]
```

---

## Quick Reference Commands

### Start Servers
```bash
# Remote dev server
npm run hello-remote:serve:mobile

# Mobile shell (in separate terminal)
npm run mobile-shell:android
```

### Port Forwarding
```bash
# Android emulator
npm run adb:reverse

# Verify
adb reverse --list
```

### Debugging
```bash
# Check remote entry
curl http://localhost:9004/remoteEntry.js

# Clear caches
npm run nx:reset

# Check processes
ps aux | grep rspack
```

### Logs
```bash
# Android logcat
adb logcat | grep -E "ScriptManager|Federated|App"

# Or use React Native debugger
# Or check Metro bundler console
```

---

## Next Steps After Testing

### If All Tests Pass ✅

1. Proceed with Phase 7: Cleanup & Optimization
2. Remove backup files (or keep for reference)
3. Update documentation
4. Final code review
5. Mark refactoring as complete

### If Tests Fail ❌

1. Document the specific failure
2. Check troubleshooting guide above
3. Review implementation
4. Apply fixes
5. Re-test

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-29  
**Status**: Ready for Manual Testing

