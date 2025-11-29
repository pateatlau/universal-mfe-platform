# Cursor Master Prompt — Re.Pack MFv2 + ScriptManager Refactor

You must follow this prompt exactly.  
All implementation MUST follow the specification and constraints below.

---

## 🎯 Objective

Refactor the existing Nx Universal MFE project so that:

- **mobile-shell** becomes a fully working **Module Federation v2 host** using Re.Pack.
- **hello-remote** becomes a native MFv2 **remote container** loaded via ScriptManager.
- All boundaries, directory structures, and configs follow the provided documentation.

---

## 📚 Required Documentation (always follow these)

You must use all of these files as the source of truth:

1. `docs/repack-mf-v2-scriptmanager-integration-guide.md`
2. `docs/repack-mf-v2-integration-checklist.md`
3. `docs/repack-mf-poc-mobile-shell-hello-remote.md`
4. `docs/nx-bundling-boundaries.md`
5. `docs/troubleshooting.md` — for error handling

If anything is unclear, prefer the MFv2 + ScriptManager integration guide above all others.

---

## 🧩 High-Level Requirements

### Host (`apps/mobile-shell`)
- Must bundle with **Re.Pack**, not Metro.
- Must use **ModuleFederationPluginV2**.
- Must import ScriptManager in a `bootstrap.ts`.
- Must load remotes using:
  ```ts
  Federated.importModule('HelloRemote', './HelloRemote')
  ```

### Remote (`apps/hello-remote`)
- Must produce a **native MF container** via Re.Pack.
- Must expose:
  ```json
  { "./HelloRemote": "./src/app/HelloRemote" }
  ```
- Must generate `HelloRemote.container.js.bundle`.

### Shared Code
- All shared logic comes from libs (e.g. `libs/shared-utils`).
- Apps must NOT import from other apps.

---

## 🛠️ Tasks Cursor Must Perform

1. Add/verify Re.Pack configs:
   - `apps/mobile-shell/webpack.repack.mjs`
   - `apps/hello-remote/webpack.repack.native.mjs`

2. Implement ScriptManager bootstrap fully and correctly.

3. Implement runtime remote loading using `Federated.importModule`.

4. Add Nx targets:
   - `hello-remote:serve-native`
   - `mobile-shell:serve-android`

5. Validate remote bundles resolve via ScriptManager’s `addResolver`.

6. Ensure bundling boundaries match `/docs/nx-bundling-boundaries.md`.

---

## ⚠️ Critical Constraints

- **Do NOT create or modify native modules for ScriptManager.**
- **Do NOT use Rspack's MF plugin in native apps.**
- **Do NOT import Metro or mix bundlers.**
- **Do NOT auto-mount UI inside remote entry.**
- **Do NOT change directory structure defined in Nx docs.**

Everything must remain within Nx's structure and bundling boundaries.

---

## 🚀 Final Output Requirements

Cursor must produce:

- Updated configs
- Updated entry files
- A working MFv2 + ScriptManager setup
- Host app that loads remote component successfully on Android

After implementing everything, Cursor should run through the checklist in:

`docs/repack-mf-v2-integration-checklist.md`

to verify correctness.

