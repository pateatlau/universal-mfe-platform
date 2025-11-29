// Test file to verify TurboModule registration
// This will be imported early to check if ScriptManager is available

import { TurboModuleRegistry } from 'react-native';

console.log('=== TurboModule Registration Test ===');
const scriptManager = TurboModuleRegistry.get('ScriptManager');
console.log('ScriptManager TurboModule:', scriptManager ? 'FOUND ✅' : 'NOT FOUND ❌');

if (scriptManager) {
  console.log('ScriptManager methods:', Object.keys(scriptManager));
} else {
  console.log('TurboModuleRegistry available modules:', TurboModuleRegistry);
  // Try to get all available modules
  const allModules = (TurboModuleRegistry as any).getEnforcing?.('ScriptManager');
  console.log('getEnforcing result:', allModules);
}

export {};

