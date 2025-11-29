# Nx-Optimized Bundling Boundaries — Universal MFE Platform

This document defines **how Nx projects should be structured** and **what boundaries to enforce** so that:

- Web (Rspack) and Native (Re.Pack) bundling concerns stay isolated.
- Shared code lives in proper libs.
- Module Federation hosts/remotes are clean and composable.

---

## 1. Recommended project layout

```text
apps/
  web-shell/            # Web host (Rspack MF)
  mobile-shell/         # Mobile host (Re.Pack MFv2)
  hello-remote/         # Universal remote (web + native builds)

libs/
  shared-utils/         # Shared logic (no platform-specific code)
  ui/                   # Optional: RN-only UI components
  mf-config/            # Optional: shared MF config helpers
docs/
  ...
```

Key ideas:

- **Single remote source** (hello-remote) with multiple bundler configs.
- **Hosts are apps**; **remotes are apps** (not libs).
- Shared code is always in libs; never in app-to-app imports.

---

## 2. Tsconfig path mapping

In `tsconfig.base.json`:

```jsonc
{
  "compilerOptions": {
    "paths": {
      "@universal-mfe-platform/shared-utils": ["libs/shared-utils/src/index.ts"],
      "@universal-mfe-platform/ui": ["libs/ui/src/index.ts"],
      "@universal-mfe-platform/mf-config": ["libs/mf-config/src/index.ts"]
    }
  }
}
```

Cursor should respect these aliases in all imports.

---

## 3. Enforce boundaries with tags

In each `project.json`, set tags.

### 3.1 apps/web-shell/project.json

```jsonc
{
  "tags": ["type:app", "platform:web", "role:host"]
}
```

### 3.2 apps/mobile-shell/project.json

```jsonc
{
  "tags": ["type:app", "platform:native", "role:host"]
}
```

### 3.3 apps/hello-remote/project.json

```jsonc
{
  "tags": ["type:app", "platform:universal", "role:remote"]
}
```

### 3.4 libs/shared-utils/project.json

```jsonc
{
  "tags": ["type:lib", "layer:shared"]
}
```

---

## 4. Nx lint / dependency rules

Add a lint rule (e.g., via `eslint-plugin-nx` or custom rules) to enforce:

1. **Apps must not import other apps.**
   - `apps/*` cannot import from `apps/*`.
   - Hosts and remotes communicate via MF, not direct imports.

2. **Hosts and remotes can only import from shared libs.**
   - Allowed imports:
     - `@universal-mfe-platform/shared-utils`
     - `@universal-mfe-platform/ui`
     - other `libs/*` as needed.

3. **No bundler-specific imports in shared libs.**
   - `libs/*` must not import:
     - `@rspack/core`
     - `@callstack/repack`
     - `webpack` or bundler internals.

Example (conceptual) rule:

```jsonc
{
  "sourceTag": "type:app",
  "onlyDependOnLibsWithTags": ["type:lib"]
}
```

And:

```jsonc
{
  "sourceTag": "layer:shared",
  "notDependOnLibsWithTags": ["platform:web", "platform:native"]
}
```

---

## 5. Separate bundler configs per app

For clarity:

- `apps/web-shell/rspack.config.mjs`
- `apps/hello-remote/rspack.remote.web.mjs`
- `apps/hello-remote/webpack.repack.native.mjs`
- `apps/mobile-shell/webpack.repack.mjs`

Rules for Cursor:

- **Web bundling = Rspack** configs only.
- **Native bundling = Re.Pack** configs only.
- No app should mix both Rspack and Re.Pack in the same config file.

---

## 6. Targets per app

### 6.1 web-shell

```jsonc
{
  "targets": {
    "serve": {
      "executor": "@nx/rspack:rspack-dev-server",
      "options": {
        "rspackConfig": "apps/web-shell/rspack.config.mjs"
      }
    }
  }
}
```

### 6.2 hello-remote

```jsonc
{
  "targets": {
    "serve-web": {
      "executor": "@nx/rspack:rspack-dev-server",
      "options": {
        "rspackConfig": "apps/hello-remote/rspack.remote.web.mjs"
      }
    },
    "serve-native": {
      "executor": "nx:run-commands",
      "options": {
        "command": "repack-dev-server --config apps/hello-remote/webpack.repack.native.mjs"
      }
    }
  }
}
```

### 6.3 mobile-shell

```jsonc
{
  "targets": {
    "serve-android": {
      "executor": "nx:run-commands",
      "options": {
        "command": "repack-dev-server --config apps/mobile-shell/webpack.repack.mjs --platform android"
      }
    }
  }
}
```

---

## 7. Summary

For Cursor:

- Keep **web** and **native** bundling completely separate.
- Use **apps** only as shells or remotes, not as shared code.
- Use **libs** for shared business logic and UI.
- Enforce boundaries with Nx tags + lint rules so MF promises are preserved.
