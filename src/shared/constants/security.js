/**
 * Security & Product Key Configuration Constants
 * Allows hash-based product key activation
 */

// Default known product key SHA-256 hashes
// The developer can provide / replace the target hash anytime
export const PRODUCT_KEY_CONFIG = {
  // Configured Product Key SHA-256 hashes (lowercase)
  // Developers can append or replace hashes here anytime
  VALID_KEY_HASHES: [
    // SHA-256 of 'developer@v2c'
    'b9675a79afaaa683b781cd72ef25274728b743e9038ef254c2d6ceea91c167bc',
    // SHA-256 of 'SHEPHERD-2026-PROD-KEY'
    '77c36f2ae3c1fce9c1eee68808949114f5e460a2a2734338af867feed6be9064',
    // SHA-256 of 'SHEPHERD-2026-KEY'
    'a259867fb00738846911404bcdd8cdf04b5435bd2b06cddb3ad25c3a27caa7e0'
  ],
  // Fallback plaintext developer master key for direct validation
  DEVELOPER_MASTER_KEY: 'developer@v2c'
};
