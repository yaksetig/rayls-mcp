/**
 * Factory for creating DefiLlama clients
 * Returns either a real or mock client based on the TEST_MODE environment variable
 */

import { defiLlamaClient } from "./defillama.client.js";
import { mockDefiLlamaClient } from "./defillama.mock.client.js";

/**
 * Get the appropriate DefiLlama client based on the TEST_MODE environment variable
 */
export function getDefiLlamaClient() {
  // Check if TEST_MODE is set to 'true' (case-insensitive)
  const isTestMode = process.env.TEST_MODE?.toLowerCase() === 'true';
  
  return isTestMode ? mockDefiLlamaClient : defiLlamaClient;
} 