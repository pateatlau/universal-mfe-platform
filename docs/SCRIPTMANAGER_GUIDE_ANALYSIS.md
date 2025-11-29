# Critical Analysis: ScriptManager Setup Guide

## Technical Accuracy & Refactoring Viability Assessment

**Date**: 2026-01-29  
**Author**: Senior Universal MFE Architect  
**Document Analyzed**: `docs/scriptmanager-setup.md`

---

## Executive Summary

**Verdict**: ⚠️ **PARTIALLY ACCURATE WITH CRITICAL CLARIFICATIONS NEEDED**

The guide presents a **fundamentally different approach** than what the codebase currently implements. If the guide is correct, it reveals a **critical misunderstanding** in the current implementation. However, the guide has **technical gaps** and **unverified assumptions** that require validation before implementation.

**Key Finding**: The guide suggests ScriptManager is a **JavaScript API** (`@callstack/repack/client`), not a TurboModule. This contradicts the codebase's current TurboModule-based approach. **This distinction is critical** and must be verified.

**Confidence Level**: 60% (guide may be correct, but needs verification)

---

## 1. Critical Discrepancy Analysis

### 1.1 The Fundamental Mismatch

**Guide's Claim:**

- ScriptManager is a **JavaScript API** from `@callstack/repack/client`
- It's **not a TurboModule** that needs to be registered
- Import: `import { ScriptManager, Script } from '@callstack/repack/client'`
- Use: `ScriptManager.shared.setStorage()`, `ScriptManager.shared.addResolver()`

**Current Codebase Approach:**

- Treats ScriptManager as a **TurboModule**
- Uses: `TurboModuleRegistry.get('ScriptManager')`
- Mocks it as a native module (1740 lines)
- Replaces `NativeScriptManager.js` with mock

**Impact**: If the guide is correct, the entire 1740-line mock is **unnecessary and based on a fundamental misunderstanding**.

### 1.2 What This Means

**If Guide is Correct:**

- ✅ Remove all TurboModule-related code
- ✅ Remove the 1740-line mock (`repack-patch.js`)
- ✅ Remove `NormalModuleReplacementPlugin` that replaces `NativeScriptManager.js`
- ✅ Use JavaScript API approach instead
- ✅ Much simpler implementation

**If Guide is Incorrect:**

- ❌ Guide is misleading
- ❌ Current TurboModule approach may be correct
- ❌ Need to verify actual Re.Pack implementation

---

## 2. Technical Accuracy Assessment

### 2.1 Accurate Claims ✅

1. **ScriptManager Import Path**

   - ✅ Guide: `import { ScriptManager, Script } from '@callstack/repack/client'`
   - ✅ This path exists in Re.Pack package structure
   - ✅ Verifiable in `node_modules/@callstack/repack/client`

2. **Bootstrap Pattern**

   - ✅ Separating bootstrap logic is a good practice
   - ✅ `AppRegistry.registerComponent()` in bootstrap is correct
   - ✅ Configuration before app registration is logical

3. **Resolver Pattern**

   - ✅ `addResolver()` pattern matches Re.Pack's documented API
   - ✅ URL mapping approach is correct
   - ✅ Dev vs production URL handling is appropriate

4. **Storage Configuration**
   - ✅ `setStorage(AsyncStorage)` is a valid API
   - ✅ Caching bundles is a recommended practice

### 2.2 Potentially Inaccurate Claims ⚠️

1. **"ScriptManager is not a TurboModule"**

   - ⚠️ **UNVERIFIED**: Guide claims this, but codebase suggests otherwise
   - ⚠️ Re.Pack may use TurboModule internally even if API is JavaScript
   - ⚠️ `NativeScriptManager.js` exists in Re.Pack (codebase replaces it)
   - ⚠️ `ScriptManagerPackage` exists in native code (codebase registers it)

2. **"Re.Pack handles native integration under the hood"**

   - ⚠️ **PARTIALLY TRUE**: Re.Pack may abstract it, but native module still needed
   - ⚠️ Codebase shows `ScriptManagerPackage` registration is required
   - ⚠️ May need both: JS API usage + native module registration

3. **Module Federation Integration**
   - ⚠️ **UNVERIFIED**: Guide says "Re.Pack's MF runtime calls ScriptManager internally"
   - ⚠️ Doesn't explain how Module Federation PluginV2 uses ScriptManager
   - ⚠️ May need explicit configuration beyond just bootstrap

### 2.3 Missing Critical Information ❌

1. **Module Federation PluginV2 Integration**

   - ❌ Guide doesn't explain how `ModuleFederationPluginV2` uses ScriptManager
   - ❌ Doesn't show connection between bootstrap and plugin
   - ❌ Missing: How remotes are resolved via ScriptManager

2. **Native Module Registration**

   - ❌ Guide says "not a separate native package" but doesn't address:
     - Is `ScriptManagerPackage` still needed?
     - Does `MainApplication.kt` registration still required?
     - What about `System.loadLibrary("callstack-repack")`?

3. **New Architecture Compatibility**

   - ❌ Guide doesn't mention New Architecture
   - ❌ Doesn't address if approach works with New Architecture enabled
   - ❌ May be the root cause of current issues

4. **Error Handling**
   - ❌ Guide doesn't explain what happens if ScriptManager.shared is undefined
   - ❌ Missing troubleshooting steps
   - ❌ No guidance on debugging resolver failures

---

## 3. Codebase Compatibility Analysis

### 3.1 What Needs to Change (If Guide is Correct)

**Files to Modify:**

1. **`apps/mobile-shell/src/main.tsx`**

   - ❌ Remove TurboModuleRegistry patching (lines 1-26)
   - ✅ Add bootstrap import instead

2. **`apps/mobile-shell/rspack.config.js`**

   - ❌ Remove `NormalModuleReplacementPlugin` for `NativeScriptManager.js` (lines 67-70)
   - ✅ Keep Module Federation plugin

3. **`apps/mobile-shell/src/repack-patch.js`**

   - ❌ **DELETE ENTIRE FILE** (1740 lines)
   - ✅ Replace with bootstrap.ts per guide

4. **`apps/mobile-shell/android/app/src/main/java/com/mobileshell/MainApplication.kt`**

   - ⚠️ **UNCLEAR**: Keep `ScriptManagerPackage()` registration?
   - ⚠️ Guide doesn't address this

5. **New Files to Create:**
   - ✅ `apps/mobile-shell/src/bootstrap.ts` (per guide)
   - ✅ `apps/mobile-shell/src/debug/validateScriptManager.ts` (optional)
   - ✅ `apps/mobile-shell/src/debug/testScriptManagerLoad.ts` (optional)

### 3.2 Dependencies to Add

**Required:**

- ✅ `@callstack/repack` (already installed)
- ✅ `@react-native-async-storage/async-storage` (needs installation)

**Check:**

```bash
npm list @react-native-async-storage/async-storage
```

If missing:

```bash
npm install @react-native-async-storage/async-storage
```

---

## 4. Verification Steps (Before Implementation)

### 4.1 Verify ScriptManager API Exists

**Step 1: Check Re.Pack Package Structure**

```bash
ls -la node_modules/@callstack/repack/client
cat node_modules/@callstack/repack/client/package.json
```

**Step 2: Verify ScriptManager Export**

```bash
grep -r "ScriptManager" node_modules/@callstack/repack/client/dist
grep -r "export.*ScriptManager" node_modules/@callstack/repack/client
```

**Step 3: Check TypeScript Definitions**

```bash
find node_modules/@callstack/repack -name "*.d.ts" | xargs grep -l "ScriptManager"
```

### 4.2 Verify Native Module Still Needed

**Step 1: Check if NativeScriptManager.js Exists**

```bash
find node_modules/@callstack/repack -name "NativeScriptManager.js"
cat node_modules/@callstack/repack/dist/modules/ScriptManager/NativeScriptManager.js
```

**Step 2: Understand NativeScriptManager's Role**

- Does it import from TurboModuleRegistry?
- Or does it use the JavaScript API?
- This determines if native registration is still needed

**Step 3: Check Re.Pack Documentation**

- Official Re.Pack docs on ScriptManager
- GitHub issues about ScriptManager + Module Federation
- Examples in Re.Pack repository

### 4.3 Test Minimal Implementation

**Create Test File:**

```typescript
// apps/mobile-shell/src/test-scriptmanager.ts
import { ScriptManager } from '@callstack/repack/client';

console.log('ScriptManager:', ScriptManager);
console.log('ScriptManager.shared:', ScriptManager?.shared);
```

**If this fails:**

- Guide may be incorrect
- Or Re.Pack version doesn't support this API
- Need to check Re.Pack version compatibility

---

## 5. Implementation Risk Assessment

### 5.1 Low Risk Changes ✅

1. **Creating bootstrap.ts** - Low risk, isolated file
2. **Adding validation helpers** - Low risk, debugging only
3. **Installing AsyncStorage** - Low risk, standard package

### 5.2 Medium Risk Changes ⚠️

1. **Removing TurboModuleRegistry patching** - Medium risk

   - If guide is wrong, app may crash
   - Easy to revert
   - Can test in isolation

2. **Removing NormalModuleReplacementPlugin** - Medium risk
   - If native module still needed, may break
   - Easy to revert
   - Can test incrementally

### 5.3 High Risk Changes ❌

1. **Deleting repack-patch.js** - High risk

   - 1740 lines of work
   - Hard to recreate if needed
   - **Recommendation**: Rename to `.backup` first, don't delete

2. **Removing ScriptManagerPackage registration** - High risk
   - May break native functionality
   - **Recommendation**: Keep it, test if still needed

---

## 6. Recommended Implementation Strategy

### 6.1 Phase 1: Verification (1-2 hours)

1. **Verify ScriptManager API exists**

   ```bash
   # Check if API is available
   node -e "const { ScriptManager } = require('@callstack/repack/client'); console.log(ScriptManager);"
   ```

2. **Check Re.Pack version compatibility**

   - Current: `@callstack/repack@^5.2.2`
   - Verify this version supports the guide's approach
   - Check changelog for ScriptManager API changes

3. **Review NativeScriptManager.js**
   - Read actual implementation
   - Understand if it uses TurboModule or JS API
   - Determine if native registration is still needed

### 6.2 Phase 2: Incremental Implementation (2-4 hours)

1. **Create bootstrap.ts** (per guide)

   - Don't remove existing code yet
   - Test if ScriptManager.shared exists

2. **Add validation helpers**

   - Test ScriptManager availability
   - Log status to console

3. **Test in isolation**
   - Run app, check logs
   - Verify ScriptManager.shared is not undefined
   - If undefined, guide may be incorrect

### 6.3 Phase 3: Integration (2-3 hours)

1. **Update main.tsx**

   - Import bootstrap instead of patching
   - Keep TurboModuleRegistry patch commented out

2. **Test Module Federation**

   - See if remote loading works
   - Check if containers register
   - Monitor for errors

3. **Remove mock if working**
   - Only after confirming ScriptManager works
   - Rename repack-patch.js to .backup first

### 6.4 Phase 4: Cleanup (1-2 hours)

1. **Remove NormalModuleReplacementPlugin**

   - Only if ScriptManager works without it

2. **Verify native registration**

   - Test with and without ScriptManagerPackage
   - Keep if still needed

3. **Final testing**
   - End-to-end remote loading
   - Container registration
   - Component rendering

---

## 7. Critical Questions to Answer

### 7.1 Before Implementation

1. **Does `@callstack/repack/client` export ScriptManager?**

   - ✅ Verify this first
   - ❌ If no, guide is incorrect

2. **Is ScriptManager.shared available at runtime?**

   - ✅ Test in minimal setup
   - ❌ If undefined, investigate why

3. **Does NativeScriptManager.js use TurboModule or JS API?**

   - ✅ Read actual implementation
   - ⚠️ Determines if native registration needed

4. **Does ModuleFederationPluginV2 use ScriptManager.shared?**
   - ✅ Check plugin source code
   - ⚠️ May need explicit configuration

### 7.2 During Implementation

1. **Does removing TurboModuleRegistry patch break anything?**

   - Test incrementally
   - Keep patch commented for quick revert

2. **Does removing NormalModuleReplacementPlugin work?**

   - Test with and without
   - May still need it for other reasons

3. **Is ScriptManagerPackage registration still needed?**
   - Test with and without
   - Keep if ScriptManager.shared is undefined without it

---

## 8. Potential Issues & Solutions

### 8.1 Issue: ScriptManager.shared is undefined

**Possible Causes:**

- Re.Pack not properly bundled
- Native module not registered
- Version incompatibility
- Import path incorrect

**Solutions:**

1. Verify Re.Pack is in dependencies (not just devDependencies)
2. Check if ScriptManagerPackage registration is needed
3. Verify import path: `@callstack/repack/client`
4. Check Re.Pack version compatibility

### 8.2 Issue: Module Federation still doesn't work

**Possible Causes:**

- ScriptManager configured but not used by plugin
- Resolver not called by Module Federation
- URL resolution incorrect
- Container registration still fails

**Solutions:**

1. Check if ModuleFederationPluginV2 uses ScriptManager internally
2. Verify resolver is called (add logging)
3. Check remote URLs are correct
4. Verify container registration mechanism

### 8.3 Issue: Native module still required

**Possible Causes:**

- ScriptManager JS API uses native module internally
- Re.Pack requires both JS API + native registration
- New Architecture compatibility issue

**Solutions:**

1. Keep ScriptManagerPackage registration
2. Keep System.loadLibrary call
3. Test with Old Architecture if New Architecture fails

---

## 9. Final Verdict

### 9.1 Is the Guide Accurate?

**Partially Accurate** ⚠️

- ✅ ScriptManager API likely exists in `@callstack/repack/client`
- ✅ Bootstrap pattern is correct
- ✅ Resolver pattern is correct
- ⚠️ "Not a TurboModule" claim needs verification
- ⚠️ Native module registration status unclear
- ❌ Missing Module Federation integration details

### 9.2 Can It Help Refactoring?

**Yes, with Caveats** ✅

**Benefits:**

- ✅ Simpler approach than 1740-line mock
- ✅ Uses official Re.Pack API
- ✅ Follows recommended patterns
- ✅ Easier to maintain

**Risks:**

- ⚠️ Guide may be incomplete
- ⚠️ Native module may still be needed
- ⚠️ Module Federation integration unclear
- ⚠️ New Architecture compatibility unknown

### 9.3 Recommendation

**Proceed with Cautious Implementation** ⚠️

1. **Verify first** (1-2 hours)

   - Check ScriptManager API exists
   - Read NativeScriptManager.js implementation
   - Test minimal setup

2. **Implement incrementally** (4-6 hours)

   - Create bootstrap.ts
   - Test ScriptManager.shared availability
   - Keep existing code as backup

3. **Test thoroughly** (2-3 hours)

   - Verify ScriptManager works
   - Test Module Federation integration
   - Check container registration

4. **Clean up only if working** (1-2 hours)
   - Remove mock only after confirmation
   - Keep native registration if needed

**Total Estimated Time**: 8-13 hours

**Success Probability**: 70% (if guide is accurate), 30% (if guide is incomplete)

---

## 10. Action Items

### Immediate (Before Implementation)

1. ✅ Verify `@callstack/repack/client` exports ScriptManager
2. ✅ Read `NativeScriptManager.js` to understand implementation
3. ✅ Check Re.Pack documentation/examples
4. ✅ Install `@react-native-async-storage/async-storage` if missing

### Implementation

1. ✅ Create bootstrap.ts per guide
2. ✅ Add validation helpers
3. ✅ Test ScriptManager.shared availability
4. ✅ Integrate with Module Federation
5. ✅ Test end-to-end

### Cleanup (Only if Working)

1. ✅ Remove TurboModuleRegistry patching
2. ✅ Remove NormalModuleReplacementPlugin (if not needed)
3. ✅ Backup (don't delete) repack-patch.js
4. ✅ Verify native registration still needed

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-29  
**Status**: Ready for Implementation (with verification steps)
