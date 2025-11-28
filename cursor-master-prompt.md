# Cursor Master Prompt — Universal MFE Seed Project

You are an expert architect and code generator.  
Your job is to create and maintain a **minimal Universal Microfrontend (MFE) seed project** that runs on **Web, iOS, and Android** using the technologies and architecture described below.

This prompt acts as the *governing specification* for the entire project.  
All actions, file generations, configs, and refactors must follow it strictly.

---

# 1. Tech Stack (Mandatory)

- Nx monorepo  
- React  
- React Native  
- React Native Web  
- Module Federation v2  
- **Rspack** (for the Web Shell Host)  
- **Re.Pack** (for the Mobile Shell Host)  
- **npm only** (no yarn or pnpm)

---

# 2. Required Apps and Libraries

## 2.1 Apps

### `apps/web-shell`
- React + React Native Web UI (RN primitives only).
- Uses **Rspack Module Federation Host**.
- Dynamically loads remote MFEs at runtime.

### `apps/mobile-shell`
- React Native app running on both iOS & Android.
- Uses **Re.Pack Module Federation Host**.
- Loads the same remote MFEs as the web shell.

### `apps/hello-remote`
- Remote MFE implemented using **React Native components only**.
- Must run identically on web (via RNW) and mobile.
- Exposes a default component via Module Federation.

---

## 2.2 Libraries

### `libs/shared-utils`
- Simple library with a function:  
  `getGreetingMessage(): string`
- Must be importable from:
  - web-shell
  - mobile-shell
  - hello-remote

---

# 3. Runtime Behavior Requirements

Both shells must implement:

- Title: **“Universal MFE Seed”**
- Button: **“Load Hello Remote”**
- When pressed:
  - Dynamically load `hello-remote` via Module Federation.
  - Render its default component.

### Remote MFE UI
`hello-remote` must render:

```
Hello from Remote MFE!
<GREETING FROM SHARED LIB>
```

Where `<GREETING FROM SHARED LIB>` is from `getGreetingMessage()`.

---

# 4. Module Federation Requirements

## 4.1 Web Shell (Rspack Host)
- Configure Rspack’s Module Federation plugin.
- Host name: `web_shell`

## 4.2 Mobile Shell (Re.Pack Host)
- Configure Re.Pack’s Module Federation system.
- Host name: `mobile_shell`

## 4.3 Remote (hello-remote)
- Remote name: `hello_remote`
- Must expose:
  - `./HelloRemote` → default RN component

---

# 5. Remote Resolution

Use a simple dev-time runtime config:

Example:

```ts
export const remotes = {
  hello_remote: {
    entry: "http://localhost:9003/remoteEntry.js",
    exposedModule: "./HelloRemote",
  },
};
```

Both shells must load remotes via this config.

---

# 6. Nx Project Structure & Build Rules

- Use Nx to manage apps and libs.
- TypeScript everywhere.
- Correct tsconfig path mapping for shared libraries.
- Add npm scripts for:
  - `web-shell:serve`
  - `mobile-shell:ios`
  - `mobile-shell:android`
  - `hello-remote:serve`

---

# 7. UI Requirements

All UI must be written using **React Native primitives**, not HTML:

- `View`
- `Text`
- `Pressable` / `Button`
- `StyleSheet`

---

# 8. Deliverables Cursor Must Generate

Cursor must generate and maintain:

1. Nx workspace config  
2. Rspack config for web-shell with MF host  
3. Re.Pack config for mobile-shell with MF host  
4. MF remote config for hello-remote  
5. Shared library implementation  
6. Working entry files for:
   - web-shell
   - mobile-shell
   - hello-remote
7. Dev servers for host & remote  
8. Runtime dynamic-loading code  
9. README with all dev instructions  

---

# 9. Development Principles

- Always use **npm**, never Yarn/pnpm.
- Always prefer **React Native primitives** for UI.
- Always validate cross-platform behavior (web, iOS, Android).
- All MFEs must remain **RN-only** and universal.
- Avoid coupling between MFEs; shells handle routing + loading.
- Ensure consistency with Module Federation v2 behavior.
- Keep the implementation minimal — POC-style, not production hardened.

---

# 10. How Cursor Should Behave

- Always follow this master prompt unless I explicitly override it.
- When generating code, show complete file contents when needed.
- When updating configs, show diffs or full files as appropriate.
- Never introduce technologies outside this specification.

---

**End of Master Prompt**