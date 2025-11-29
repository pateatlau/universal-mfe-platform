// Mock webpack Logger for React Native compatibility
// This replaces webpack/lib/logging/Logger.js which doesn't exist in RN
const mockLogger = {
  error: function() {},
  warn: function() {},
  info: function() {},
  log: function() {},
  debug: function() {},
  group: function() {},
  groupCollapsed: function() {},
  groupEnd: function() {},
  time: function() {},
  timeEnd: function() {},
  profile: function() {},
  profileEnd: function() {},
  clear: function() {},
  status: function() {},
};

// Export as { Logger: ... } to match webpack's export format
module.exports = { Logger: mockLogger };
module.exports.Logger = mockLogger;

