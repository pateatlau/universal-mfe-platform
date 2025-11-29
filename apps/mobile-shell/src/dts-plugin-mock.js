// Mock DTS plugin to replace the real one that tries to create websockets
// The real DTS plugin is not compatible with React Native environment

function dynamicRemoteTypeHintsPlugin() {
  // Return a no-op plugin that matches the real plugin's interface
  // but doesn't try to create websockets
  return {
    name: 'dynamic-remote-type-hints-plugin',
    registerRemote(args) {
      // No-op: just return the args unchanged
      // The real plugin would send websocket messages here
      return args;
    }
  };
}

module.exports = dynamicRemoteTypeHintsPlugin;

