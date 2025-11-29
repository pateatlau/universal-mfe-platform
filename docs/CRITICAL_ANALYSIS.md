# Critical Analysis: Refactor vs. Start Fresh

## Universal MFE Platform - Senior Architect Assessment

**Date**: 2026-01-29  
**Author**: Senior Universal MFE Architect  
**Status**: ⚠️ **CONDITIONAL RECOMMENDATION**

---

## Executive Summary

**Recommendation**: **REFACTOR THE EXISTING CODEBASE** with a critical caveat: This is only viable if the ScriptManager TurboModule issue can be resolved. If ScriptManager cannot be enabled, the current approach is fundamentally flawed and alternative architectures must be considered.

**Confidence Level**: 70% (conditional on ScriptManager resolution)

**Key Finding**: The codebase demonstrates **sound architecture** and **working web implementation**. The mobile blocker is **isolated to a single native module issue** that may be resolvable. However, if ScriptManager cannot be fixed, the Module Federation approach for mobile is not viable with Re.Pack.

---

## 1. Current State Assessment

### 1.1 What's Working ✅

1. **Web Shell (100% Functional)**

   - Module Federation works perfectly
   - Remote loading and rendering successful
   - Shared library integration working
   - Clean, maintainable code
   - Uses correct plugin (`ModuleFederationPlugin` from `@rspack/core`)

2. **Build Infrastructure (100% Functional)**

   - Dual-build strategy correctly implemented
   - Web remote (Rspack) builds successfully
   - Mobile remote (Re.Pack) builds successfully
   - Nx monorepo structure is sound
   - TypeScript path mappings correct

3. **Architecture Design (Sound)**

   - Correct separation of web and mobile builds
   - Proper plugin usage (web uses Rspack plugin, mobile uses Re.Pack plugin)
   - Module Federation contract alignment (name, exposes, shared modules)
   - Network configuration handled correctly

4. **Native Module Registration (Appears Correct)**
   - `MainApplication.kt` properly imports `ScriptManagerPackage`
   - Native library included in `settings.gradle`
   - Native library linked in `build.gradle`
   - `System.loadLibrary("callstack-repack")` called in `onCreate()`
   - New Architecture enabled

### 1.2 What's Broken ❌

1. **ScriptManager TurboModule (Critical Blocker)**

   - `TurboModuleRegistry.get('ScriptManager')` returns `null`
   - Despite proper native module registration
   - Module Federation v2 cannot function without it
   - Container registration fails completely

2. **Mock ScriptManager (1740 lines - Should be Removed)**

   - Complex, fragile workaround
   - Cannot replicate TurboModule behavior
   - Prevents proper diagnosis
   - Adds significant maintenance burden

3. **Mobile Remote Loading (Consequence of #1)**
   - Scripts execute but containers don't register
   - Module Federation runtime never initializes properly
   - Remote components cannot be loaded

---

## 2. Root Cause Analysis

### 2.1 Why ScriptManager TurboModule Fails

**Hypothesis 1: New Architecture Compatibility Issue** (Most Likely)

- Re.Pack 5.2.2 may have incomplete New Architecture support
- ScriptManager TurboModule may not be properly registered for New Architecture
- Native module registration works, but TurboModule bridge fails

**Hypothesis 2: Build Configuration Issue** (Possible)

- Native library may not be compiled correctly
- TurboModule codegen may be missing
- Gradle build may not include ScriptManager native code

**Hypothesis 3: Version Incompatibility** (Less Likely)

- React Native 0.79.3 may have breaking changes
- Re.Pack 5.2.2 may not fully support RN 0.79.3
- New Architecture changes may have broken compatibility

**Hypothesis 4: Nx Monorepo Integration Issue** (Possible)

- Autolinking may not work correctly in Nx monorepo
- Native module paths may be incorrect
- Build system may not properly link Re.Pack native code

### 2.2 Evidence Supporting Each Hypothesis

**Hypothesis 1 (New Architecture):**

- ✅ New Architecture is enabled (`newArchEnabled=true`)
- ✅ `MainApplication.kt` uses `DefaultNewArchitectureEntryPoint.load()`
- ⚠️ Re.Pack documentation may not explicitly state New Architecture support
- ⚠️ ScriptManager may only work with Old Architecture

**Hypothesis 2 (Build Configuration):**

- ✅ Native library is included in `settings.gradle`
- ✅ Native library is linked in `build.gradle`
- ⚠️ TurboModule codegen may not be running
- ⚠️ Native code may not be compiled for correct architecture

**Hypothesis 3 (Version Incompatibility):**

- ⚠️ React Native 0.79.3 is very recent (January 2026)
- ⚠️ Re.Pack 5.2.2 may not have been tested with RN 0.79.3
- ⚠️ New Architecture in RN 0.79.3 may have breaking changes

**Hypothesis 4 (Nx Integration):**

- ✅ Manual native module registration in `MainApplication.kt`
- ⚠️ Autolinking comment suggests it doesn't work in Nx
- ⚠️ Native module paths may be incorrect for monorepo structure

---

## 3. Feasibility Assessment

### 3.1 Refactoring Feasibility: **CONDITIONAL** ⚠️

**Refactoring is feasible IF:**

1. ScriptManager TurboModule can be enabled (see Section 4)
2. Mock ScriptManager can be removed (straightforward)
3. Container registration works once ScriptManager is enabled (expected)

**Refactoring is NOT feasible IF:**

1. ScriptManager TurboModule cannot be enabled (fundamental blocker)
2. Re.Pack Module Federation v2 requires ScriptManager and it's unavailable
3. Alternative approaches are needed (see Section 5)

### 3.2 Code Quality Assessment

**Strengths:**

- ✅ Clean separation of concerns
- ✅ Well-structured build configurations
- ✅ Proper use of Nx monorepo patterns
- ✅ TypeScript throughout
- ✅ Working web implementation as reference
- ✅ Minimal technical debt (except mock ScriptManager)

**Weaknesses:**

- ⚠️ 1740 lines of mock code that must be removed
- ⚠️ Multiple compatibility layers (mocks for Logger, HMR, DTS plugin)
- ⚠️ Complex runtime patching logic
- ⚠️ Network configuration complexity

**Assessment**: Code quality is **good**. The mock ScriptManager is the primary technical debt, but it's isolated and can be removed cleanly.

### 3.3 Time and Effort Estimate

**If ScriptManager Can Be Fixed:**

- Remove mock ScriptManager: **2-4 hours**
- Fix ScriptManager TurboModule: **1-3 days** (investigation + fix)
- Test and validate: **1-2 days**
- Clean up compatibility layers: **1 day**
- **Total: 4-7 days**

**If ScriptManager Cannot Be Fixed:**

- Evaluate alternatives: **2-3 days**
- Implement alternative approach: **1-2 weeks**
- **Total: 2-3 weeks** (or start fresh with different approach)

---

## 4. ScriptManager Resolution Strategy

### 4.1 Investigation Steps (Priority Order)

**Step 1: Verify ScriptManager Availability** (1-2 hours)

```kotlin
// Add to MainApplication.kt onCreate()
try {
    val scriptManager = TurboModuleManager.getModule("ScriptManager")
    Log.d("ScriptManager", "Found: ${scriptManager != null}")
} catch (e: Exception) {
    Log.e("ScriptManager", "Error: ${e.message}")
}
```

**Step 2: Check Re.Pack Documentation** (1 hour)

- Verify ScriptManager support in Re.Pack 5.2.2
- Check New Architecture compatibility
- Review known issues and limitations

**Step 3: Test with Old Architecture** (2-4 hours)

- Temporarily disable New Architecture
- Test if ScriptManager works with Old Architecture
- If yes, this confirms New Architecture compatibility issue

**Step 4: Verify Native Build** (2-3 hours)

- Check if native library is compiled
- Verify TurboModule codegen output
- Check build logs for errors

**Step 5: Test Minimal Re.Pack Setup** (3-4 hours)

- Create minimal Re.Pack app outside Nx monorepo
- Test ScriptManager in isolation
- If works, issue is Nx integration; if not, issue is Re.Pack

### 4.2 Potential Solutions

**Solution A: Disable New Architecture** (If Hypothesis 1 is correct)

- Set `newArchEnabled=false` in `gradle.properties`
- Re.Pack may only support Old Architecture
- **Trade-off**: Lose New Architecture benefits

**Solution B: Fix Native Module Registration** (If Hypothesis 2 is correct)

- Ensure TurboModule codegen runs
- Fix native library linking
- Verify build configuration

**Solution C: Downgrade React Native** (If Hypothesis 3 is correct)

- Test with RN 0.76 or 0.77
- Verify Re.Pack compatibility
- **Trade-off**: Lose latest RN features

**Solution D: Fix Nx Integration** (If Hypothesis 4 is correct)

- Fix autolinking or manual registration
- Correct native module paths
- Ensure build system includes Re.Pack native code

**Solution E: Wait for Re.Pack Update** (If framework issue)

- Check Re.Pack GitHub issues
- Wait for New Architecture support
- **Trade-off**: Delayed timeline

---

## 5. Alternative Approaches (If ScriptManager Cannot Be Fixed)

### 5.1 Alternative 1: Dynamic Import Without Module Federation

**Approach**: Use React Native's dynamic imports with code splitting

- **Pros**: No native module dependency, simpler architecture
- **Cons**: Lose runtime dynamic loading, requires build-time integration
- **Effort**: 1-2 weeks
- **Viability**: High

### 5.2 Alternative 2: Custom Native Module Bridge

**Approach**: Create custom native module to replace ScriptManager

- **Pros**: Full control, can work with New Architecture
- **Cons**: Significant native development, maintenance burden
- **Effort**: 2-3 weeks
- **Viability**: Medium (requires native expertise)

### 5.3 Alternative 3: WebView-Based Remotes

**Approach**: Load remotes in WebView (for web remotes only)

- **Pros**: Works immediately, no native module needed
- **Cons**: Performance penalty, loses native components, not true RN
- **Effort**: 1 week
- **Viability**: Low (defeats purpose of universal MFE)

### 5.4 Alternative 4: Build-Time Integration

**Approach**: Bundle remotes at build time instead of runtime

- **Pros**: No runtime loading complexity, simpler
- **Cons**: Lose dynamic loading benefits, requires rebuild for updates
- **Effort**: 1 week
- **Viability**: Medium (loses key MFE benefit)

### 5.5 Alternative 5: Hybrid Architecture

**Approach**: Use Module Federation for web, build-time integration for mobile

- **Pros**: Best of both worlds, web keeps dynamic loading
- **Cons**: Different architectures for web vs mobile
- **Effort**: 1-2 weeks
- **Viability**: High (pragmatic compromise)

---

## 6. Final Recommendation

### 6.1 Primary Recommendation: **REFACTOR WITH CONDITIONS** ⚠️

**Proceed with refactoring IF:**

1. ScriptManager TurboModule can be enabled within **1 week** of investigation
2. Solution doesn't require disabling New Architecture (unless acceptable)
3. Solution doesn't require significant native development

**Abandon refactoring IF:**

1. ScriptManager cannot be enabled after **1 week** of investigation
2. Only solution is disabling New Architecture (and that's unacceptable)
3. Re.Pack doesn't support ScriptManager in New Architecture (framework limitation)

### 6.2 Decision Tree

```
START
  │
  ├─→ Can ScriptManager be enabled?
  │   │
  │   ├─→ YES (within 1 week)
  │   │   ├─→ Remove mock ScriptManager
  │   │   ├─→ Fix native module registration
  │   │   ├─→ Test and validate
  │   │   └─→ ✅ REFACTOR SUCCESSFUL
  │   │
  │   └─→ NO (after 1 week investigation)
  │       │
  │       ├─→ Is disabling New Architecture acceptable?
  │       │   │
  │       │   ├─→ YES
  │       │   │   ├─→ Disable New Architecture
  │       │   │   └─→ ✅ REFACTOR SUCCESSFUL (with trade-off)
  │       │   │
  │       │   └─→ NO
  │       │       │
  │       │       ├─→ Evaluate Alternative Approaches (Section 5)
  │       │       ├─→ Implement best alternative
  │       │       └─→ ⚠️ REFACTOR WITH ARCHITECTURE CHANGE
  │       │
  │       └─→ Is Re.Pack Module Federation required?
  │           │
  │           ├─→ NO (alternatives acceptable)
  │           │   └─→ Implement Alternative 1, 4, or 5
  │           │
  │           └─→ YES (Module Federation is hard requirement)
  │               └─→ ❌ START FRESH with different approach
```

### 6.3 Risk Assessment

**Refactoring Risks:**

- **High Risk**: ScriptManager cannot be fixed → wasted effort
- **Medium Risk**: Solution requires disabling New Architecture → technical debt
- **Low Risk**: Solution requires minor native fixes → manageable

**Starting Fresh Risks:**

- **High Risk**: Lose working web implementation
- **Medium Risk**: Lose time invested in architecture design
- **Low Risk**: Clean slate allows better decisions

**Mitigation:**

- Set **1-week investigation deadline** for ScriptManager
- If not resolved, pivot to alternative approach
- Preserve web implementation regardless of decision

---

## 7. Action Plan

### 7.1 Immediate Actions (This Week)

1. **Day 1-2: ScriptManager Investigation**

   - Follow investigation steps (Section 4.1)
   - Test with Old Architecture
   - Check Re.Pack documentation and issues
   - Determine root cause

2. **Day 3-4: Attempt Fixes**

   - Try Solution A, B, C, or D (Section 4.2)
   - Test each solution
   - Document results

3. **Day 5: Decision Point**
   - If ScriptManager works: Proceed with refactoring
   - If ScriptManager doesn't work: Evaluate alternatives
   - Make go/no-go decision

### 7.2 If Refactoring Proceeds

**Week 1:**

- Remove mock ScriptManager
- Fix native module registration
- Test ScriptManager in isolation

**Week 2:**

- Re-enable Module Federation
- Test remote loading
- Clean up compatibility layers

**Week 3:**

- Integration testing
- Documentation
- Demo preparation

### 7.3 If Refactoring Abandoned

**Week 1:**

- Evaluate alternative approaches
- Select best alternative
- Design new architecture

**Week 2-3:**

- Implement alternative approach
- Preserve web implementation
- Test and validate

---

## 8. Conclusion

The existing codebase demonstrates **strong architecture** and **working web implementation**. The mobile blocker is **isolated to a single native module issue** that may be resolvable.

**Refactoring is recommended** with the critical condition that ScriptManager TurboModule can be enabled within 1 week of investigation. If ScriptManager cannot be fixed, the Module Federation approach for mobile is not viable with Re.Pack, and alternative architectures must be considered.

**Key Success Factors:**

1. ScriptManager TurboModule resolution (critical)
2. Removal of mock ScriptManager (straightforward)
3. Preservation of working web implementation (non-negotiable)

**Timeline**: 1 week investigation + 2-3 weeks implementation (if refactoring proceeds)

**Confidence**: 70% that refactoring will succeed (conditional on ScriptManager resolution)

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-29  
**Next Review**: After ScriptManager investigation (Day 5)
