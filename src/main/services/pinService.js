import crypto from 'crypto';
import { getSetting, setSetting } from '../repositories/settingsRepository.js';

export function hashPin(pinStr) {
  return crypto.createHash('sha256').update(String(pinStr).trim()).digest('hex');
}

export function isPinProtected() {
  const hashed = getSetting('security_pin_hash', '');
  return Boolean(hashed);
}

export function verifyPin(inputPin) {
  const storedHash = getSetting('security_pin_hash', '');
  if (!storedHash) return true; // No PIN configured

  const inputHash = hashPin(inputPin);
  return inputHash === storedHash;
}

export function setSecurityPin(oldPin, newPin) {
  const isProtected = isPinProtected();
  if (isProtected && !verifyPin(oldPin)) {
    throw new Error('Current security PIN is incorrect.');
  }

  if (!/^\d{4}$/.test(String(newPin))) {
    throw new Error('PIN must be exactly 4 numeric digits.');
  }

  const hashed = hashPin(newPin);
  setSetting('security_pin_hash', hashed);
  return true;
}

export function disableSecurityPin(currentPin) {
  if (!verifyPin(currentPin)) {
    throw new Error('Current security PIN is incorrect.');
  }
  setSetting('security_pin_hash', '');
  return true;
}
