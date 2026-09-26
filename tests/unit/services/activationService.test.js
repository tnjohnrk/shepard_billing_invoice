import { describe, it, expect, beforeEach, vi } from 'vitest';
import { hashString, activateProductKey, createInitialPassword, isProductActivated, getActivationDetails } from '../../../src/main/services/activationService.js';
import * as settingsRepo from '../../../src/main/repositories/settingsRepository.js';

vi.mock('../../../src/main/repositories/settingsRepository.js', () => {
  const store = {};
  return {
    getSetting: vi.fn((key, defVal) => store[key] !== undefined ? store[key] : defVal),
    setSetting: vi.fn((key, val) => { store[key] = val; })
  };
});

describe('activationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('computes correct sha256 hash', () => {
    const hash = hashString('developer@v2c');
    expect(hash).toBe('b9675a79afaaa683b781cd72ef25274728b743e9038ef254c2d6ceea91c167bc');
  });

  it('rejects invalid product key', () => {
    expect(() => activateProductKey('INVALID-KEY-123')).toThrow(/Invalid Product Key/);
  });

  it('rejects empty product key', () => {
    expect(() => activateProductKey('')).toThrow(/Product key cannot be empty/);
  });

  it('successfully activates with valid product key', () => {
    const res = activateProductKey('v2c_live_1UFnNrF7aOXoHIWz0RssPR0Oka9jEysX');
    expect(res.success).toBe(true);
    expect(settingsRepo.setSetting).toHaveBeenCalledWith('product_key_activated', 'true');
  });

  it('successfully activates with developer master key', () => {
    const res = activateProductKey('developer@v2c');
    expect(res.success).toBe(true);
  });

  it('creates initial password after activation', () => {
    // activate first
    activateProductKey('v2c_live_1UFnNrF7aOXoHIWz0RssPR0Oka9jEysX');
    const res = createInitialPassword('Admin@123');
    expect(res.success).toBe(true);
    expect(settingsRepo.setSetting).toHaveBeenCalledWith('security_pin_hash', expect.any(String));
  });

  it('rejects passwords shorter than 4 characters', () => {
    activateProductKey('v2c_live_1UFnNrF7aOXoHIWz0RssPR0Oka9jEysX');
    expect(() => createInitialPassword('12')).toThrow(/at least 4 characters/);
  });
});
