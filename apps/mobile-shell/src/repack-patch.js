// Workaround: Create a mock NativeScriptManager module
// This file will be aliased in webpack config to replace the real NativeScriptManager
// when the TurboModule isn't available

const { TurboModuleRegistry } = require('react-native');

// Try to get the real module first
const realModule = TurboModuleRegistry.get('ScriptManager');

// If not found, export a mock that satisfies the interface
const mockModule = {
  loadScript: async (_scriptId, _config) => Promise.resolve(null),
  prefetchScript: async (_scriptId, _config) => Promise.resolve(null),
  invalidateScripts: async (_scripts) => Promise.resolve(null),
  unstable_evaluateScript: (_scriptSource, _scriptSourceUrl) => false,
};

// Export enums that are also exported by the real module
const NormalizedScriptLocatorHTTPMethod = {
  GET: 'GET',
  POST: 'POST',
};

const NormalizedScriptLocatorSignatureVerificationMode = {
  STRICT: 'strict',
  LAX: 'lax',
  OFF: 'off',
};

// Export the module (real if available, mock otherwise)
module.exports = realModule || mockModule;
module.exports.NormalizedScriptLocatorHTTPMethod = NormalizedScriptLocatorHTTPMethod;
module.exports.NormalizedScriptLocatorSignatureVerificationMode = NormalizedScriptLocatorSignatureVerificationMode;

