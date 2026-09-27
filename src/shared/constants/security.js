/**
 * Security & Product Key Configuration Constants
 * Allows hash-based product key activation
 */

// Default known product key SHA-256 hashes
export const PRODUCT_KEY_CONFIG = {
  // Configured Product Key SHA-256 hashes (lowercase)
  VALID_KEY_HASHES: [
    // Production Software License Key Hash
    'b91eabc1404241120bcb4bd25b689b354da9054b44a81940625a48b68bdc755a',
    // Developer Master Hash
    'b9675a79afaaa683b781cd72ef25274728b743e9038ef254c2d6ceea91c167bc'
  ]
};
