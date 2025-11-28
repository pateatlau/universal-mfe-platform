# Universal MFE Platform

A minimal Universal Microfrontend (MFE) seed project that runs on **Web, iOS, and Android** using React, React Native, Rspack, and Re.Pack.

## Tech Stack

- **Nx** monorepo
- **React** & **React Native**
- **React Native Web**
- **Module Federation v2**
- **Rspack** (for Web Shell Host)
- **Re.Pack** (for Mobile Shell Host)
- **npm** only (no yarn or pnpm)

## Project Structure

```
universal-mfe-platform/
├── apps/
│   ├── web-shell/          # React + RN Web with Rspack MF Host (to be created)
│   ├── mobile-shell/        # React Native with Re.Pack MF Host (to be created)
│   └── hello-remote/        # Remote MFE with RN components (to be created)
├── libs/
│   └── shared-utils/        # Shared utilities library
└── ...
```

## Current Status

✅ **Nx monorepo initialized** with npm  
✅ **Dependencies installed** for React, React Native, RN Web, Rspack, and Re.Pack  
✅ **TypeScript configuration** with path mappings  
✅ **Basic project structure** prepared  
✅ **Shared utils library** scaffolded  

## Next Steps

The following apps need to be created:

1. **`apps/web-shell`** - React + React Native Web UI using Rspack Module Federation Host
2. **`apps/mobile-shell`** - React Native app using Re.Pack Module Federation Host
3. **`apps/hello-remote`** - Remote MFE with React Native components

## Development

This workspace is prepared for development. Once apps are created, you'll be able to run:

- `npm run web-shell:serve` - Start web shell dev server
- `npm run mobile-shell:ios` - Run mobile shell on iOS
- `npm run mobile-shell:android` - Run mobile shell on Android
- `npm run hello-remote:serve` - Start hello-remote dev server

## Configuration

- **TypeScript**: Configured with path mappings in `tsconfig.base.json`
- **Nx**: Configured with Rspack plugin in `nx.json`
- **Package Manager**: npm only

## References

See `cursor-master-prompt.md` for the complete specification and requirements.

