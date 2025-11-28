/**
 * Web Entry Point for Development (Standalone Mode)
 *
 * This file is used ONLY for standalone development of the remote.
 * When consumed via Module Federation, entry.tsx is used instead.
 *
 * We use React DOM here (not AppRegistry) for better HMR support.
 * The component itself is universal and works with both.
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import HomeScreen from './screens/HomeScreen';

// Type declaration for HMR
declare const module: {
  hot?: {
    accept: (dependencies?: string | string[], callback?: () => void) => void;
  };
};

// Initialize chunk registry to prevent HMR errors
// This must happen synchronously before any imports
// Must match chunkLoadingGlobal in rspack.config.js
if (typeof window !== 'undefined') {
  // Initialize the specific chunk loading global used by this remote
  const chunkGlobal = 'webpackChunkfeature_home_remote';
  if (!(window as any)[chunkGlobal]) {
    (window as any)[chunkGlobal] = [];
  }
  // Also initialize default as fallback
  if (!(window as any).webpackChunk) {
    (window as any).webpackChunk = [];
  }
}

// Render the app for standalone development
if (typeof window !== 'undefined') {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    const root = createRoot(rootElement);

    // Render function that can be called on HMR updates
    const render = () => {
      root.render(<HomeScreen />);
    };

    // Initial render
    render();

    // Disable HMR acceptance to prevent crashes in standalone mode
    // HMR is problematic with Module Federation remotes in standalone mode
    // The page will reload on changes instead, which is more stable
    // When consumed via Module Federation, HMR works correctly from the host
    if (module.hot) {
      // Don't accept HMR updates - let the page reload instead
      // This prevents crashes while still allowing development
      // Comment out module.hot.accept() to disable HMR and use page reload
    }
  }
}
