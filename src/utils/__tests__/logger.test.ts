import { logger } from '../logger';

// Mock console methods
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

describe('logger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set NODE_ENV to development for tests
    process.env.NODE_ENV = 'development';
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should log errors in development', () => {
    logger.error('Test error');
    expect(consoleErrorSpy).toHaveBeenCalledWith('Test error', undefined);
  });

  it('should handle error objects', () => {
    const error = new Error('Test error');
    logger.error('Error occurred:', error);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error occurred:', error);
  });

  it('should not log errors in production', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    jest.clearAllMocks();
    
    logger.error('Test error');
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    
    process.env.NODE_ENV = originalEnv;
  });
});

