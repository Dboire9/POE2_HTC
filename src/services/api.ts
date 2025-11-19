/**
 * API service layer for POE2_HTC
 * Direct HTTP communication with backend (no Electron IPC wrapper)
 */

import type {
  Item,
  Modifier,
  Currency,
  CraftingRequest,
  CraftingResult,
  ProgressData,
  ErrorResponse,
} from '../types/api';
import { CraftingError } from '../types/errors';

class CraftingAPI {
  private readonly baseURL = 'http://localhost:8080/api';

  /**
   * Fetch all available items
   */
  async getItems(): Promise<Item[]> {
    const response = await fetch(`${this.baseURL}/items`);
    
    if (!response.ok) {
      throw new CraftingError(
        'NETWORK_ERROR',
        `Failed to fetch items: ${response.statusText}`
      );
    }
    
    return response.json();
  }

  /**
   * Fetch all available currencies
   */
  async getCurrencies(): Promise<Currency[]> {
    const response = await fetch(`${this.baseURL}/currencies`);
    
    if (!response.ok) {
      throw new CraftingError(
        'NETWORK_ERROR',
        `Failed to fetch currencies: ${response.statusText}`
      );
    }
    
    return response.json();
  }

  /**
   * Fetch modifiers for a specific item
   */
  async getModifiers(itemId: string): Promise<Modifier[]> {
    const response = await fetch(`${this.baseURL}/modifiers?itemId=${encodeURIComponent(itemId)}`);
    
    if (!response.ok) {
      throw new CraftingError(
        'NETWORK_ERROR',
        `Failed to fetch modifiers: ${response.statusText}`
      );
    }
    
    return response.json();
  }

  /**
   * Calculate crafting path
   */
  async calculate(
    request: CraftingRequest,
    signal?: AbortSignal
  ): Promise<CraftingResult> {
    try {
      const response = await fetch(`${this.baseURL}/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal,
      });

      if (!response.ok) {
        // Try to parse error response
        try {
          const errorData: ErrorResponse = await response.json();
          throw CraftingError.fromResponse(errorData);
        } catch (parseError) {
          throw new CraftingError(
            'NETWORK_ERROR',
            `Calculation failed: ${response.statusText}`
          );
        }
      }

      return response.json();
    } catch (error) {
      if (error instanceof CraftingError) {
        throw error;
      }
      
      // Handle abort
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new CraftingError(
          'NETWORK_ERROR',
          'Calculation was cancelled',
          [],
          true
        );
      }

      throw CraftingError.fromUnknown(error);
    }
  }

  /**
   * Get progress for a calculation session
   */
  async getProgress(sessionId: string): Promise<ProgressData> {
    const response = await fetch(`${this.baseURL}/progress/${sessionId}`);
    
    if (!response.ok) {
      throw new CraftingError(
        'NETWORK_ERROR',
        `Failed to fetch progress: ${response.statusText}`
      );
    }
    
    return response.json();
  }

  /**
   * Cancel a running calculation
   */
  async cancel(sessionId: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/cancel/${sessionId}`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new CraftingError(
        'NETWORK_ERROR',
        `Failed to cancel calculation: ${response.statusText}`
      );
    }
  }
}

// Export singleton instance
export const api = new CraftingAPI();
