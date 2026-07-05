/**
 * Simple logging utility for operational and business events
 * Can be migrated to Winston/Pino in the future
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  BUSINESS: 3,
};

const currentLogLevel = process.env.LOG_LEVEL || "BUSINESS";

const shouldLog = (level) => {
  return LOG_LEVELS[level] <= LOG_LEVELS[currentLogLevel];
};

class Logger {
  static formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const formatted = data ? `${message} ${JSON.stringify(data)}` : message;
    return `[${timestamp}] [${level}] ${formatted}`;
  }

  static error(message, data = null) {
    if (shouldLog("ERROR")) {
      console.error(this.formatMessage("ERROR", message, data));
    }
  }

  static warn(message, data = null) {
    if (shouldLog("WARN")) {
      console.warn(this.formatMessage("WARN", message, data));
    }
  }

  static info(message, data = null) {
    if (shouldLog("INFO")) {
      console.log(this.formatMessage("INFO", message, data));
    }
  }

  /**
   * Log business events (dispatches, assignments, cancellations, etc.)
   */
  static business(event, data = null) {
    if (shouldLog("BUSINESS")) {
      console.log(this.formatMessage("BUSINESS", event, data));
    }
  }
}

module.exports = Logger;