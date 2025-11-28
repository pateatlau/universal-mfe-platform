# Universal MFE Platform - Running Instructions

This document provides step-by-step instructions for running the web and mobile (Android) versions of the Universal MFE Platform.

## Prerequisites

- Node.js installed
- Android SDK and Android Studio installed
- Android emulator running or physical device connected
- All dependencies installed: `npm install`

## Port Usage

- **4200**: Web Shell (host)
- **4201**: Feature Home Remote (web)
- **8081**: Mobile Shell (Metro/Re.Pack bundler)
- **9000**: Feature Home Remote (native/Re.Pack)

## Quick Commands

### Kill All Services

```bash
npm run kill:all
```

---

## Web Version (Rspack + Module Federation)

The web version uses Rspack with Module Federation to load remote micro-frontends.

### Option 1: Run All Services Together (Recommended)

**Terminal 1:**

```bash
npm run start:web:all
```

This starts both:

- Remote server on port 4201
- Web shell on port 4200

Then open: **http://localhost:4200**

### Option 2: Run Services Separately

**Terminal 1 - Start Remote:**

```bash
npm run start:web:remote
# or
nx serve feature-home-remote
```

**Terminal 2 - Start Web Shell:**

```bash
npm run start:web
# or
nx serve web-shell
```

Then open: **http://localhost:4200**

### Web Commands Reference

| Command                    | Description                          |
| -------------------------- | ------------------------------------ |
| `npm run start:web`        | Start web shell only                 |
| `npm run start:web:remote` | Start remote server only             |
| `npm run start:web:all`    | Start both (requires `concurrently`) |
| `npm run build:web`        | Build web shell for production       |
| `npm run build:remote`     | Build remote for production          |

---

## Mobile Version (Android)

The mobile version supports two modes:

1. **Metro Mode**: Standard React Native bundler (no Module Federation)
2. **Re.Pack Mode**: Webpack-based bundler with Module Federation support

### Metro Mode (Standard - No Module Federation)

**Terminal 1 - Start Metro Bundler:**

```bash
npm run start:mobile
# or
nx serve mobile-shell
```

**Terminal 2 - Run Android App:**

```bash
npm run start:mobile:android
# or
nx run-android mobile-shell
```

The app will install and launch on your Android emulator/device.

### Re.Pack Mode (With Module Federation)

This mode enables dynamic loading of remote micro-frontends on native.

**Terminal 1 - Start Native Remote Server:**

```bash
npm run start:mobile:remote
# or
nx serve-native feature-home-remote
```

**Terminal 2 - Start Re.Pack Dev Server:**

```bash
npm run start:mobile:repack
# or
nx serve-repack mobile-shell
```

**Terminal 3 - Run Android App:**

```bash
npm run start:mobile:android
# or
nx run-android mobile-shell
```

The app will:

1. Install and launch on Android
2. Connect to Re.Pack dev server on port 8081
3. Be able to load remote HomeScreen dynamically

### Mobile Commands Reference

| Command                           | Description                                             |
| --------------------------------- | ------------------------------------------------------- |
| `npm run start:mobile`            | Start Metro bundler (standard mode)                     |
| `npm run start:mobile:repack`     | Start Re.Pack bundler (Module Federation mode)          |
| `npm run start:mobile:android`    | Build and run Android app                               |
| `npm run start:mobile:remote`     | Start native remote server (for Re.Pack mode)           |
| `npm run start:mobile:repack:all` | Start both remote and Re.Pack (requires `concurrently`) |
| `npm run build:mobile`            | Build mobile bundle for production                      |

---

## Troubleshooting

### Port Already in Use

If you get port conflicts:

```bash
npm run kill:all
```

Then restart the services.

### Android App Not Connecting

1. Ensure Metro/Re.Pack is running on port 8081
2. Check that your emulator/device can reach `localhost:8081`
   - For physical device: Use your computer's IP address
   - Shake device → Dev Settings → Debug server host → Enter IP:8081

### Module Federation Not Working (Mobile)

1. Ensure remote server is running on port 9000
2. Check that Re.Pack mode is active (not Metro)
3. Verify webpack configs are correct
4. Check app logs: `adb logcat | grep ReactNativeJS`

### Web Remote Not Loading

1. Ensure remote server is running on port 4201
2. Check browser console for errors
3. Verify CORS settings if needed

---

## Development Workflow

### Web Development

1. Start remote: `npm run start:web:remote`
2. Start shell: `npm run start:web`
3. Open http://localhost:4200
4. Make changes - HMR will update automatically

### Mobile Development (Metro)

1. Start Metro: `npm run start:mobile`
2. Run app: `npm run start:mobile:android`
3. Make changes - Fast Refresh will update automatically

### Mobile Development (Re.Pack with MFE)

1. Start remote: `npm run start:mobile:remote`
2. Start Re.Pack: `npm run start:mobile:repack`
3. Run app: `npm run start:mobile:android`
4. Make changes - HMR will update automatically
5. Click "Load Remote Screen" button in app to test Module Federation

---

## Architecture Overview

```
┌─────────────────┐
│   Web Shell     │  (Port 4200)
│  (Rspack Host)  │
└────────┬────────┘
         │ Module Federation
         ▼
┌─────────────────┐
│  Home Remote    │  (Port 4201 - Web)
│  (Rspack)       │
└─────────────────┘

┌─────────────────┐
│  Mobile Shell   │  (Port 8081 - Metro/Re.Pack)
│  (Re.Pack Host) │
└────────┬────────┘
         │ Module Federation
         ▼
┌─────────────────┐
│  Home Remote    │  (Port 9000 - Native)
│  (Re.Pack)      │
└─────────────────┘
```

---

## Next Steps

- [ ] iOS setup and configuration
- [ ] Production build configurations
- [ ] CI/CD pipeline setup
- [ ] Additional remote micro-frontends
