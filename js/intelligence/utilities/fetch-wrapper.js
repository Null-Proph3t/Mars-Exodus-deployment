/**
 * Fetch Wrapper Utility
 * Handles standard JSON fetching with timeout and error handling.
 */

export class FetchWrapper {
  static async get(url, options = {}) {
    const { timeout = 8000, ...fetchOptions } = options;
    
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal
      });
      clearTimeout(id);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      clearTimeout(id);
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Space communication delay.');
      }
      throw error;
    }
  }
}
