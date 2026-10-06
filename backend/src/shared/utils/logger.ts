/* ==============================================================================
 * ERP-Ayantrai Backend: Minimalist Structured Logger
 * ============================================================================== */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const formatTimestamp = (): string => {
  return new Date().toISOString();
};

const colorize = (level: LogLevel, text: string): string => {
  // ANSI colors
  switch (level) {
    case 'info':
      return `\x1b[36m${text}\x1b[0m`; // Cyan
    case 'warn':
      return `\x1b[33m${text}\x1b[0m`; // Yellow
    case 'error':
      return `\x1b[31m${text}\x1b[0m`; // Red
    case 'debug':
      return `\x1b[35m${text}\x1b[0m`; // Magenta
    default:
      return text;
  }
};

export const logger = {
  info: (message: string, ...args: any[]): void => {
    console.log(
      `[${formatTimestamp()}] ${colorize('info', '[INFO]')}: ${message}`,
      ...args
    );
  },
  warn: (message: string, ...args: any[]): void => {
    console.warn(
      `[${formatTimestamp()}] ${colorize('warn', '[WARN]')}: ${message}`,
      ...args
    );
  },
  error: (message: string, ...args: any[]): void => {
    console.error(
      `[${formatTimestamp()}] ${colorize('error', '[ERROR]')}: ${message}`,
      ...args
    );
  },
  debug: (message: string, ...args: any[]): void => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(
        `[${formatTimestamp()}] ${colorize('debug', '[DEBUG]')}: ${message}`,
        ...args
      );
    }
  },
};

export default logger;
