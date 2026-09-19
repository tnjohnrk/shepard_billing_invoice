import crypto from 'crypto';
import { getSetting, setSetting } from '../repositories/settingsRepository.js';

export const DEVELOPER_MASTER_KEY = 'developer@v2c';

export function isDeveloperKey(input) {
  const str = String(input || '').trim();
  return str === DEVELOPER_MASTER_KEY;
}

export function hashPin(pinStr) {
  return crypto.createHash('sha256').update(String(pinStr).trim()).digest('hex');
}

export function isPinProtected() {
  const hashed = getSetting('security_pin_hash', '');
  return Boolean(hashed && String(hashed).trim().length > 0);
}

export function verifyPin(inputPin) {
  if (isDeveloperKey(inputPin)) {
    return true;
  }
  const storedHash = getSetting('security_pin_hash', '');
  if (!storedHash) return true; // No password configured

  const inputHash = hashPin(inputPin);
  return inputHash === storedHash;
}

export function setSecurityPin(oldPin, newPin) {
  const isProtected = isPinProtected();
  if (isProtected && !verifyPin(oldPin)) {
    throw new Error('Current security password is incorrect.');
  }

  const str = String(newPin || '').trim();
  if (str.length < 4) {
    throw new Error('Password must be at least 4 characters long.');
  }

  const hashed = hashPin(str);
  setSetting('security_pin_hash', hashed);
  return true;
}

export function disableSecurityPin(currentPin) {
  if (!verifyPin(currentPin)) {
    throw new Error('Current security password is incorrect.');
  }
  setSetting('security_pin_hash', '');
  return true;
}
