# POC-0 Setup Guide

## Prerequisites

- Node.js 18+ 
- npm or yarn
- For mobile development: Xcode (iOS) and Android Studio (Android)

## Installation

```bash
npm install
```

## Development

### Start Web Shell

```bash
npm run start:web
```

The web shell will be available at `http://localhost:4200`

### Start Mobile Shell

```bash
npm run start:mobile
```

Then run on iOS:
```bash
nx run-ios mobile-shell
```

Or Android:
```bash
nx run-android mobile-shell
```

### Start Home Remote

```bash
npm run start:remote:home
```

The remote will be available at `http://localhost:4201`

## Architecture Notes

### Module Federation

- **Web Shell**: Uses Rspack with Module Federation to load remotes
- **Mobile Shell**: Uses Re.Pack (webpack-based) with Module Federation
- **Remotes**: Expose a single normalized entry point (`./HomeScreen`)

### Shared Dependencies

All shared dependencies are configured in `libs/config-mf/src/lib/mf-config.ts`:
- react
- react-dom
- react-native
- react-native-web

### Manifest-Based Remote Resolution

In production, remotes are resolved via `public/manifest.json`. The manifest loader (`libs/config-mf/src/lib/manifest-loader.ts`) handles:
- Loading the manifest from a URL
- Resolving remotes by name and platform
- Version compatibility checking

## Project Structure

```
apps/
  web-shell/              # Web host (Rspack + Module Federation)
  mobile-shell/          # Mobile host (Re.Pack + Module Federation)
  feature-home-remote/   # First remote MFE

libs/
  ui-universal/          # Universal UI components (RN primitives)
  api/                   # API client (empty in POC-0)
  app-state/             # Global state (empty in POC-0)
  event-bus/             # Event bus (empty in POC-0)
  config-mf/             # Module Federation config + manifest loader
```

## Key Files

- `apps/web-shell/rspack.config.js` - Web shell Module Federation config
- `apps/mobile-shell/webpack.config.js` - Mobile shell Module Federation config
- `apps/feature-home-remote/rspack.config.js` - Remote Module Federation config
- `libs/config-mf/src/lib/manifest-loader.ts` - Manifest loading utilities
- `libs/config-mf/src/lib/mf-config.ts` - Shared dependencies configuration
- `public/manifest.json` - Remote manifest (development)

## Next Steps (POC-1)

- Add more remotes
- Implement event bus
- Add API client
- Implement app state management

