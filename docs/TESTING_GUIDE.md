# Testing Guide - ScriptManager Refactoring
## Phase 6: Testing & Validation

**Date**: 2026-01-29  
**Status**: Ready for Testing

---

## Quick Start Testing

### Step 1: Start Remote Dev Server

```bash
# Terminal 1: Start remote dev server
npm run hello-remote:serve:mobile
```

**Expected**: Server starts on port 9004, serves `remoteEntry.js`

**Verify**: 
```bash
curl http://localhost:9004/remoteEntry.js
# Should return JavaScript bundle
```

### Step 2: Set Up Port Forwarding (Android Emulator)

```bash
# Terminal 2: Set up port forwarding
npm run adb:reverse
```

**Expected**: Ports 8081 and 9004 forwarded to emulator

**Verify**:
```bash
adb reverse --list
# Should show tcp:8081 and tcp:9004
```

### Step 3: Start Mobile Shell

```bash
# Terminal 3: Start mobile shell (in new terminal)
npm run mobile-shell:android
```

**Expected**: 
- App builds successfully
- App launches on emulator/device
- No build errors

---

## Testing Checklist

### Test 1: App Launch ✅

**Steps**:
1. Launch the app
2. Observe initial screen

**Expected Results**:
- [ ] App launches without errors
- [ ] UI renders correctly ("Universal MFE Seed" title visible)
- [ ] "Load Hello Remote" button visible
- [ ] No red screen errors
- [ ] No ScriptManager errors in logs

**Logs to Check**:
```
[ScriptManager] configured with storage + resolver
[ScriptManager] ScriptManager.shared: [object Object]
```

**If ScriptManager.shared is undefined**:
- Check import path in bootstrap.ts
- Verify Re.Pack is properly bundled
- Check if bootstrap is imported in main.tsx

---

### Test 2: ScriptManager Bootstrap ✅

**Steps**:
1. Check console/logs immediately after app launch
2. Look for ScriptManager configuration messages

**Expected Results**:
- [ ] `[ScriptManager] configured with storage + resolver` appears in logs
- [ ] `ScriptManager.shared` is defined (not undefined)
- [ ] No errors about ScriptManager import
- [ ] No errors about AsyncStorage

**Logs to Check**:
```
[ScriptManager] configured with storage + resolver
[ScriptManager] ScriptManager.shared: [object Object]
```

**If errors occur**:
- Verify AsyncStorage is installed: `npm list @react-native-async-storage/async-storage`
- Check if AsyncStorage needs native linking (may need manual registration in MainApplication.kt)
- Verify bootstrap.ts is imported in main.tsx

---

### Test 3: Remote Loading ✅

**Steps**:
1. Click "Load Hello Remote" button
2. Observe loading state
3. Wait for remote component to load

**Expected Results**:
- [ ] Button click triggers remote load
- [ ] "Loading remote…" text appears (Suspense fallback)
- [ ] Remote component loads successfully
- [ ] Remote component renders correctly
- [ ] "Hello from Remote MFE!" text visible
- [ ] No "container not found" errors
- [ ] No network errors

**Logs to Check**:
```
[App] Loading remote component...
[ScriptManager] Resolving script: hello_remote from caller: ...
[ScriptManager] Using explicit URL: http://10.0.2.2:9004/remoteEntry.js
```

**If Suspense hangs forever**:
- Check ScriptManager resolver is called (add logging)
- Verify remote dev server is running
- Check URL resolution (Android emulator needs 10.0.2.2)
- Verify remote name matches exactly
- Check network connectivity

**If "container not found" errors**:
- Verify remote uses ModuleFederationPluginV2
- Check remote's `name` matches host's remote key
- Verify remote entry includes container registration
- Check Module Federation runtime initialization

---

### Test 4: Container Registration ✅

**Steps**:
1. After remote loads, check logs
2. Verify no container registration errors

**Expected Results**:
- [ ] Container registers automatically
- [ ] No "container not found" errors
- [ ] Module Federation runtime initializes
- [ ] Remote component is accessible

**Logs to Check**:
- No errors about container registration
- No "container not found" messages
- Module Federation runtime logs (if any)

---

### Test 5: Error Handling ✅

**Steps**:
1. Test with network disconnected (optional)
2. Test with remote server stopped (optional)

**Expected Results**:
- [ ] Network errors handled gracefully
- [ ] Suspense shows loading state
- [ ] Errors don't crash app
- [ ] User sees appropriate error message

---

### Test 6: Multiple Remote Loads ✅

**Steps**:
1. Load remote multiple times
2. Click button, wait for load, click again

**Expected Results**:
- [ ] Load remote multiple times successfully
- [ ] No duplicate registrations
- [ ] Performance is acceptable
- [ ] No memory leaks

---

### Test 7: Dev Server Restart ✅

**Steps**:
1. Restart remote dev server
2. Reload app
3. Try loading remote again

**Expected Results**:
- [ ] Remote still loads correctly after server restart
- [ ] No cached errors
- [ ] Fresh bundle is loaded

---

### Test 8: Network Scenarios ✅

**Test on Different Platforms**:

**Android Emulator**:
- [ ] Uses `10.0.2.2` for localhost (automatic via resolver)
- [ ] Remote loads successfully
- [ ] No 404 errors

**iOS Simulator**:
- [ ] Uses `localhost` (automatic via resolver)
- [ ] Remote loads successfully
- [ ] No 404 errors

**Physical Device**:
- [ ] Uses device's network IP or configured URL
- [ ] Remote loads successfully
- [ ] Network configuration works

---

## Troubleshooting

### Issue: ScriptManager.shared is undefined

**Symptoms**:
- Logs show ScriptManager.shared is undefined
- Bootstrap fails

**Solutions**:
1. Verify import: `import { ScriptManager } from '@callstack/repack/client'`
2. Check Re.Pack version: `npm list @callstack/repack`
3. Verify Re.Pack is in dependencies (not just devDependencies)
4. Clear caches: `npm run nx:reset`
5. Check if bootstrap is imported in main.tsx

---

### Issue: Federated is undefined

**Symptoms**:
- `Federated.importModule` fails
- Import error

**Solutions**:
1. Verify import: `import { Federated } from '@callstack/repack/client'`
2. Check Re.Pack version compatibility
3. Verify ModuleFederationPluginV2 is configured
4. Clear caches and rebuild

---

### Issue: Remote never loads (Suspense hangs)

**Symptoms**:
- Suspense fallback appears but never resolves
- No error messages

**Solutions**:
1. Check ScriptManager resolver is called (add logging to resolver)
2. Verify remote dev server is running: `curl http://localhost:9004/remoteEntry.js`
3. Check URL resolution:
   - Android emulator: Should use `10.0.2.2`
   - iOS simulator: Should use `localhost`
4. Verify remote name matches exactly: `'hello_remote'`
5. Check network connectivity
6. Verify remote entry is accessible

**Debug Steps**:
```typescript
// Add to bootstrap.ts resolver for debugging:
ScriptManager.shared.addResolver(async (scriptId, caller) => {
  console.log('[DEBUG] Resolver called with:', { scriptId, caller });
  // ... rest of resolver
});
```

---

### Issue: Container not found errors

**Symptoms**:
- "container not found" errors
- Remote script loads but container doesn't register

**Solutions**:
1. Verify remote uses ModuleFederationPluginV2
2. Check remote's `name` matches host's remote key exactly
3. Verify remote entry includes container registration
4. Check Module Federation runtime initialization
5. Verify shared module versions match

---

### Issue: Network errors (404, connection refused)

**Symptoms**:
- 404 errors when loading remote
- Connection refused errors

**Solutions**:
1. **Android emulator**: Verify resolver uses `10.0.2.2` (automatic)
2. **iOS simulator**: Verify resolver uses `localhost` (automatic)
3. Verify port forwarding: `adb reverse tcp:9004 tcp:9004`
4. Check dev server is running and accessible
5. Verify dev server binds to `0.0.0.0` (not just `localhost`)

**Check Dev Server**:
```bash
# Should return JavaScript bundle
curl http://localhost:9004/remoteEntry.js

# For Android emulator, test with:
curl http://10.0.2.2:9004/remoteEntry.js
```

---

### Issue: Build errors

**Symptoms**:
- TypeScript errors
- Build failures

**Solutions**:
1. Verify all imports are correct
2. Check TypeScript definitions for Re.Pack
3. Clear caches: `npm run nx:reset`
4. Reinstall dependencies: `rm -rf node_modules && npm install`
5. Check for syntax errors in new code

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
Date: [DATE]
Tester: [NAME]
Platform: [Android/iOS]
Device: [Emulator/Physical Device]

Test 1: App Launch
- [ ] Pass / [ ] Fail
- Notes: [ANY ISSUES]

Test 2: ScriptManager Bootstrap
- [ ] Pass / [ ] Fail
- Notes: [ANY ISSUES]

Test 3: Remote Loading
- [ ] Pass / [ ] Fail
- Notes: [ANY ISSUES]

Test 4: Container Registration
- [ ] Pass / [ ] Fail
- Notes: [ANY ISSUES]

Overall Result: [PASS/FAIL]
Issues Found: [LIST ANY ISSUES]
```

---

## Next Steps After Testing

### If All Tests Pass ✅

1. Proceed with Phase 7: Cleanup & Optimization
2. Remove backup files (or keep for reference)
3. Update documentation
4. Final code review

### If Tests Fail ❌

1. Document the specific failure
2. Check troubleshooting guide
3. Review implementation
4. Apply fixes
5. Re-test

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-29  
**Status**: Ready for Testing

