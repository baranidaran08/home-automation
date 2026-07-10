'use strict';

/**
 * Tiny dependency-free logger. Provides a single place to swap in a richer
 * logging library (pino/winston) later without touching call sites.
 */
const timestamp = () => new Date().toISOString();

const format = (level, args) => [`${timestamp()} [${level}]`, ...args];

const logger = {
  info: (...args) => console.log(...format('INFO', args)),
  warn: (...args) => console.warn(...format('WARN', args)),
  error: (...args) => console.error(...format('ERROR', args)),
  debug: (...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(...format('DEBUG', args));
    }
  },
  // Stream adapter so Morgan can pipe HTTP logs through this logger.
  stream: {
    write: (message) => console.log(`${timestamp()} [HTTP] ${message.trim()}`),
  },
};

module.exports = logger;
