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

const sanitizeData = (data) => {
  if (!data) return null;
  const sanitized = { ...data };
  
  // Remove sensitive fields
  const sensitiveFields = ['password', 'token', 'jwt', 'verificationToken', 'resetToken', 'secret'];
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  // Remove PII from nested objects if present
  if (sanitized.user) {
    const { password, ...userSanitized } = sanitized.user;
    sanitized.user = userSanitized;
  }
  
  return sanitized;
};

class Logger {
  static formatMessage(level, message, data = null, requestId = null) {
    const timestamp = new Date().toISOString();
    const requestIdPrefix = requestId ? `[${requestId}] ` : '';
    const sanitizedData = sanitizeData(data);
    const formatted = sanitizedData ? `${message} ${JSON.stringify(sanitizedData)}` : message;
    return `[${timestamp}] ${requestIdPrefix}[${level}] ${formatted}`;
  }

  static error(message, data = null, requestId = null) {
    if (shouldLog("ERROR")) {
      console.error(this.formatMessage("ERROR", message, data, requestId));
    }
  }

  static warn(message, data = null, requestId = null) {
    if (shouldLog("WARN")) {
      console.warn(this.formatMessage("WARN", message, data, requestId));
    }
  }

  static info(message, data = null, requestId = null) {
    if (shouldLog("INFO")) {
      console.log(this.formatMessage("INFO", message, data, requestId));
    }
  }

  /**
   * Log business events (dispatches, assignments, cancellations, etc.)
   */
  static business(event, data = null, requestId = null) {
    if (shouldLog("BUSINESS")) {
      console.log(this.formatMessage("BUSINESS", event, data, requestId));
    }
  }
}

module.exports = Logger;