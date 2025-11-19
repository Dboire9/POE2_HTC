/**
 * Error handling for POE2_HTC crafting calculations
 */

import { ErrorType, ErrorResponse } from './api';

export class CraftingError extends Error {
  constructor(
    public readonly type: ErrorType,
    message: string,
    public readonly suggestions: string[] = [],
    public readonly recoverable: boolean = true
  ) {
    super(message);
    this.name = 'CraftingError';
    
    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CraftingError);
    }
  }

  static fromResponse(response: ErrorResponse): CraftingError {
    return new CraftingError(
      response.type,
      response.message,
      response.suggestions || []
    );
  }

  static fromUnknown(error: unknown): CraftingError {
    if (error instanceof CraftingError) {
      return error;
    }

    if (error instanceof Error) {
      // Try to identify error type from message
      if (error.message.includes('OutOfMemoryError') || error.message.includes('heap')) {
        return new CraftingError(
          'HEAP_SPACE_ERROR',
          'Calculation too complex for available memory',
          [
            'Reduce the number of desired modifiers',
            'Simplify the item requirements',
            'Increase Java heap size (-Xmx flag in settings)',
          ]
        );
      }

      if (error.message.includes('timeout') || error.message.includes('timed out')) {
        return new CraftingError(
          'TIMEOUT_ERROR',
          'Calculation timed out',
          [
            'Adjust your requirements to be less complex',
            'Try a simpler item type',
            'Reduce the number of modifiers',
          ]
        );
      }

      if (error.message.includes('fetch') || error.message.includes('network')) {
        return new CraftingError(
          'NETWORK_ERROR',
          'Failed to communicate with backend server',
          [
            'Ensure the backend server is running on port 8080',
            'Check your network connection',
            'Restart the application',
          ]
        );
      }

      return new CraftingError(
        'UNKNOWN_ERROR',
        error.message,
        ['Check the console for more details', 'Try restarting the application']
      );
    }

    return new CraftingError(
      'UNKNOWN_ERROR',
      'An unknown error occurred',
      ['Check the console for more details']
    );
  }
}
