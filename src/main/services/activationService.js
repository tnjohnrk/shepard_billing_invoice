import crypto from 'crypto';
import { getSetting, setSetting } from '../repositories/settingsRepository.js';
import { PRODUCT_KEY_CONFIG } from '../../shared/constants/security.js';
import { isPinProtected, hashPin } from './pinService.js';

export function hashString(str) {
  return crypto.createHash('sha256').update(String(str || '').trim()).digest('hex').toLowerCase();
}

export function isProductActivated() {
  const isActivated = getSetting('product_key_activated', 'false');
  return isActivated === 'true' || isActivated === true;
}

export function getActivationDetails() {
  const isActivated = isProductActivated();
  const activatedAt = getSetting('product_key_activated_at', null);
  const isPasswordSet = isPinProtected();

  return {
    isActivated,
    activatedAt,
    isPasswordSet
  };
}

export function activateProductKey(inputKey) {
  const rawKey = String(inputKey || '').trim();
  if (!rawKey) {
    throw new Error('Product key cannot be empty. Please enter a valid key.');
  }

  const keyHash = hashString(rawKey);

  // Check against configured SHA-256 hashes
  const isHashMatch = PRODUCT_KEY_CONFIG.VALID_KEY_HASHES.map(h => h.toLowerCase()).includes(keyHash);

  if (!isHashMatch) {
    throw new Error('Invalid Product Key. Please contact the developer for installation activation.');
  }

  // Persist product activation state in SQLite settings
  setSetting('product_key_activated', 'true');
  setSetting('product_key_activated_at', new Date().toISOString());
  setSetting('product_key_hash_used', keyHash);

  return {
    success: true,
    message: 'Product key activated successfully!',
    isPasswordSet: isPinProtected()
  };
}

export function createInitialPassword(newPassword) {
  if (!isProductActivated()) {
    throw new Error('Software must be activated with a valid Product Key before setting a password.');
  }

  const str = String(newPassword || '').trim();
  if (str.length < 4) {
    throw new Error('Security password must be at least 4 characters long.');
  }

  const hashed = hashPin(str);
  setSetting('security_pin_hash', hashed);

  return {
    success: true,
    message: 'Security password created successfully.'
  };
}
