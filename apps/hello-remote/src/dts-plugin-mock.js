// Mock for DTS plugin - prevents websocket creation in React Native
module.exports = function() {
  return {
    apply: function() {
      // No-op - DTS plugin is not needed for React Native
    }
  };
};

