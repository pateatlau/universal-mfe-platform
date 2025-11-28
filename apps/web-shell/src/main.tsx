import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';

// Type declaration for HMR
declare const module: {
  hot?: {
    accept: (dependencies?: string | string[], callback?: () => void) => void;
  };
};

// Handle HMR for remote modules
// Fix webpackHotUpdate to properly handle remote module updates without errors
if (typeof window !== 'undefined' && module.hot) {
  // Store original webpackHotUpdate function
  const originalWebpackHotUpdate = (window as any).webpackHotUpdate;
  const chunkLoadingGlobal =
    (window as any).webpackChunkName || 'webpackChunkweb_shell';

  if (originalWebpackHotUpdate) {
    // Override webpackHotUpdate to safely handle remote module updates
    (window as any).webpackHotUpdate = function (
      chunkId: string,
      moreModules: any
    ) {
      try {
        // Ensure chunk registry exists before updating
        if (!(window as any)[chunkLoadingGlobal]) {
          (window as any)[chunkLoadingGlobal] = [];
        }

        // Use the original function - it should handle the update properly now
        return originalWebpackHotUpdate.apply(this, arguments);
      } catch (error: any) {
        // If there's an error accessing chunk registry, initialize it
        if (
          error &&
          error.message &&
          error.message.includes('Cannot set properties of undefined')
        ) {
          // Initialize the chunk registry if it doesn't exist
          if (!(window as any)[chunkLoadingGlobal]) {
            (window as any)[chunkLoadingGlobal] = [];
          }
          // Try again after initializing
          try {
            return originalWebpackHotUpdate.apply(this, arguments);
          } catch (retryError) {
            // If it still fails, log but don't reload - let React Fast Refresh handle it
            console.warn('[HMR] Warning during remote update:', retryError);
          }
        } else {
          // For other errors, log but don't reload
          console.warn('[HMR] Warning during update:', error);
        }
      }
    };
  }

  // Accept HMR updates for the app itself
  module.hot.accept('./app/App', () => {
    // App will re-render automatically via React Fast Refresh
  });
}

// Initialize React Native Web
if (typeof window !== 'undefined') {
  const root = createRoot(document.getElementById('root')!);
  root.render(<App />);
}
