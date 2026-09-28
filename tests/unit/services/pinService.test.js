import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  isDeveloperKey, 
  hashPin, 
  isPinProtected, 
  verifyPin, 
  setSecurityPin, 
  disableSecurityPin,
  DEVELOPER_MASTER_KEY 
} from '../../../src/main/services/pinService.js';
import * as settingsRepo from '../../../src/main/repositories/settingsRepository.js';

let mockStore = {};

vi.mock('../../../src/main/repositories/settingsRepository.js', () => {
  return {
    getSetting: vi.fn((key, defVal) => mockStore[key] !== undefined ? mockStore[key] : defVal),
    setSetting: vi.fn((key, val) => { mockStore[key] = val; })
  };
});

describe('pinService - Security, Password Protection & Developer Master Override', () => {
  beforeEach(() => {
    mockStore = {};
    vi.clearAllMocks();
  });

  it('correctly identifies the Developer Master Key', () => {
    expect(isDeveloperKey(DEVELOPER_MASTER_KEY)).toBe(true);
    expect(isDeveloperKey('developer@v2c')).toBe(true);
    expect(isDeveloperKey('wrongKey')).toBe(false);
    expect(isDeveloperKey('')).toBe(false);
    expect(isDeveloperKey(null)).toBe(false);
  });

  it('computes sha256 pin hash accurately', () => {
    const hash = hashPin('1234');
    expect(hash).toBe('03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4');
  });

  it('reports false for isPinProtected when no pin is stored', () => {
    expect(isPinProtected()).toBe(false);
  });

  it('allows access via verifyPin when no pin is configured', () => {
    expect(verifyPin('')).toBe(true);
    expect(verifyPin('anything')).toBe(true);
  });

  it('sets a new security pin and verifies matching input', () => {
    setSecurityPin('', 'SecurePass123');
    expect(isPinProtected()).toBe(true);
    expect(verifyPin('SecurePass123')).toBe(true);
    expect(verifyPin('WrongPass')).toBe(false);
  });

  it('always allows Developer Master Key even when PIN is set', () => {
    setSecurityPin('', 'UserPin999');
    expect(verifyPin('developer@v2c')).toBe(true);
  });

  it('rejects passwords shorter than 4 characters', () => {
    expect(() => setSecurityPin('', '123')).toThrow(/at least 4 characters/);
  });

  it('requires valid existing pin when updating password', () => {
    setSecurityPin('', 'OldSecret1');
    expect(() => setSecurityPin('WrongOld', 'NewSecret2')).toThrow(/Current security password is incorrect/);
    
    // Succeeds with correct old pin
    setSecurityPin('OldSecret1', 'NewSecret2');
    expect(verifyPin('NewSecret2')).toBe(true);
    expect(verifyPin('OldSecret1')).toBe(false);
  });

  it('disables security pin when provided valid current password', () => {
    setSecurityPin('', 'MyPassword');
    expect(isPinProtected()).toBe(true);

    expect(() => disableSecurityPin('WrongPassword')).toThrow(/Current security password is incorrect/);

    const res = disableSecurityPin('MyPassword');
    expect(res).toBe(true);
    expect(isPinProtected()).toBe(false);
  });
});
