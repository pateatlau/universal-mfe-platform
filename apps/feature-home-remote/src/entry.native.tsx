/**
 * Native Entry Point for Feature Home Remote
 *
 * This file is the entry point for the native platform (iOS/Android)
 * when the remote is loaded via Module Federation with Re.Pack.
 *
 * For native, we don't need to register a full application - 
 * we just export the components via Module Federation.
 */

// Export HomeScreen for Module Federation
export { default as HomeScreen } from './screens/HomeScreen';

// This file doesn't need to do anything special for native
// The Module Federation plugin handles exposing the components

