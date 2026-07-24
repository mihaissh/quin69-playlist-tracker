/**
 * Centralized logging utility
 * In development: logs to console
 * In production: can be extended to send to error tracking service
 */

export const logger = {
  error: (message: string, error?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(message, error);
    }
  },
};

