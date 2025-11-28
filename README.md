# Universal Web + Mobile Microfrontend Platform

A universal microfrontend platform that runs on both web and mobile using a single React Native codebase, powered by Nx, Rspack (web), Re.Pack (mobile), and Module Federation.

## Architecture

- **Web Shell**: Rspack + Module Federation host
- **Mobile Shell**: Re.Pack + Module Federation host  
- **Remotes**: React Native-only primitives, universal across platforms
- **Shared Libraries**: UI components, API, state, event bus, MF config

## Getting Started

### Install Dependencies

```bash
npm install
```

### Start Development Servers

```bash
# Start web shell
npm run start:web

# Start mobile shell (iOS)
npm run start:mobile

# Start home remote
npm run start:remote:home
```

## Project Structure

```
apps/
  web-shell/          # Web host application
  mobile-shell/       # Mobile host application
  feature-home-remote/ # First remote MFE

libs/
  ui-universal/       # Universal UI components (RN primitives)
  api/                # API client (empty in POC-0)
  app-state/          # Global state (empty in POC-0)
  event-bus/          # Event bus (empty in POC-0)
  config-mf/          # Module Federation config + manifest loader
```

## POC-0 Goals

- ✅ Nx workspace setup
- ✅ Web shell with Rspack + Module Federation
- ✅ Mobile shell with Re.Pack + Module Federation
- ✅ First remote (feature-home-remote)
- ✅ Shared UI library with HelloWorld component
- ✅ Manifest-based remote resolution

