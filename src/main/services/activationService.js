import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { getSetting, setSetting } from '../repositories/settingsRepository.js';
import { PRODUCT_KEY_CONFIG } from '../../shared/constants/security.js';
import { isPinProtected, hashPin } from './pinService.js';
import { ensureDirectoriesExist } from '../utils/filesystem.js';

const ACTIVATION_SECRET = 'V2C_SHEPHERD_SEC_KEY_9921_ENC';

function getActivationFilePath() {
  const { settingsDir } = ensureDirectoriesExist();
  return path.join(settingsDir, 'activation.dat');
}

export function hashString(str) {
  return crypto.createHash('sha256').update(String(str || '').trim()).digest('hex').toLowerCase();
}

function encryptToken(payload) {
  const iv = crypto.randomBytes(16);
  const key = crypto.createHash('sha256').update(ACTIVATION_SECRET).digest();
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(JSON.stringify(payload), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

function decryptToken(tokenStr) {
  try {
    const [ivHex, encHex] = tokenStr.split(':');
    if (!ivHex || !encHex) return null;
    const iv = Buffer.from(ivHex, 'hex');
    const key = crypto.createHash('sha256').update(ACTIVATION_SECRET).digest();
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
  } catch {
    return null;
  }
}

export function isProductActivated() {
  const activationFile = getActivationFilePath();
  if (!fs.existsSync(activationFile)) {
    return false;
  }

  try {
    const rawContent = fs.readFileSync(activationFile, 'utf8').trim();
    const token = decryptToken(rawContent);
    if (!token || !token.keyHash || !token.activatedAt) {
      return false;
    }
    const isHashMatch = PRODUCT_KEY_CONFIG.VALID_KEY_HASHES.map(h => h.toLowerCase()).includes(token.keyHash.toLowerCase());
    if (!isHashMatch) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
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

  const now = new Date().toISOString();

  // 1. Save SQLite settings
  setSetting('product_key_activated', 'true');
  setSetting('product_key_activated_at', now);
  setSetting('product_key_hash_used', keyHash);

  // 2. Encrypt and save hardware/machine activation token to activation.dat
  const activationFile = getActivationFilePath();
  const encryptedPayload = encryptToken({
    keyHash,
    activatedAt: now,
    status: 'ACTIVE'
  });
  fs.writeFileSync(activationFile, encryptedPayload, 'utf8');

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
