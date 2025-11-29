// Mock HMR modules for React Native compatibility
// This replaces @rspack/core/hot modules which reference webpack Logger
const mockLogger = {
  error: function() {},
  warn: function() {},
  info: function() {},
  log: function() {},
  debug: function() {},
};

module.exports = {
  log: mockLogger,
  emitter: {
    on: function() {},
    emit: function() {},
  },
  // Export Logger for modules that expect it
  Logger: mockLogger,
};

