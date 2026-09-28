import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getLicenseStatus, setLicenseMode } from '../../../src/main/services/licenseService.js';
import * as settingsRepo from '../../../src/main/repositories/settingsRepository.js';

let mockStore = {};

vi.mock('../../../src/main/repositories/settingsRepository.js', () => {
  return {
    getSetting: vi.fn((key, defVal) => mockStore[key] !== undefined ? mockStore[key] : defVal),
    setSetting: vi.fn((key, val) => { mockStore[key] = val; })
  };
});

describe('licenseService - Comprehensive License & Test Mode Engine', () => {
  beforeEach(() => {
    mockStore = {};
    vi.clearAllMocks();
  });

  it('initializes 10-day TEST mode automatically on first install', () => {
    const status = getLicenseStatus();
    expect(status.mode).toBe('TEST');
    expect(status.isTest).toBe(true);
    expect(status.isLive).toBe(false);
    expect(status.isExpired).toBe(false);
    expect(status.remainingDays).toBeGreaterThanOrEqual(9);
    expect(mockStore['license_mode']).toBe('TEST');
    expect(mockStore['trial_start_datetime']).toBeDefined();
    expect(mockStore['trial_end_datetime']).toBeDefined();
  });

  it('returns LIVE permanent status when license_mode is LIVE', () => {
    mockStore['license_mode'] = 'LIVE';
    const status = getLicenseStatus();
    expect(status.mode).toBe('LIVE');
    expect(status.isLive).toBe(true);
    expect(status.isTest).toBe(false);
    expect(status.isExpired).toBe(false);
    expect(status.statusMessage).toContain('Live Mode');
  });

  it('detects when TEST mode trial has expired', () => {
    const pastStart = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString();
    const pastEnd = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
    mockStore['license_mode'] = 'TEST';
    mockStore['trial_start_datetime'] = pastStart;
    mockStore['trial_end_datetime'] = pastEnd;

    const status = getLicenseStatus();
    expect(status.mode).toBe('TEST');
    expect(status.isExpired).toBe(true);
    expect(status.remainingDays).toBe(0);
    expect(status.remainingMs).toBe(0);
    expect(status.statusMessage).toContain('Expired');
  });

  it('calculates remaining days and hours accurately when trial is active', () => {
    const futureEnd = new Date(Date.now() + (4 * 24 * 60 * 60 * 1000) + (5 * 60 * 60 * 1000)).toISOString();
    mockStore['license_mode'] = 'TEST';
    mockStore['trial_start_datetime'] = new Date().toISOString();
    mockStore['trial_end_datetime'] = futureEnd;

    const status = getLicenseStatus();
    expect(status.isExpired).toBe(false);
    expect(status.remainingDays).toBe(4);
    expect(status.remainingHours).toBeGreaterThanOrEqual(4);
  });

  it('allows developer to switch mode to LIVE with valid developer key', () => {
    const updatedStatus = setLicenseMode('developer@v2c', { mode: 'LIVE' });
    expect(updatedStatus.mode).toBe('LIVE');
    expect(updatedStatus.isLive).toBe(true);
    expect(mockStore['license_mode']).toBe('LIVE');
  });

  it('allows developer to reset or extend TEST mode trial with custom date', () => {
    const customEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const updatedStatus = setLicenseMode('developer@v2c', {
      mode: 'TEST',
      endDateTime: customEnd
    });
    expect(updatedStatus.mode).toBe('TEST');
    expect(updatedStatus.isTest).toBe(true);
    expect(updatedStatus.remainingDays).toBeGreaterThanOrEqual(29);
  });

  it('rejects mode change when unauthorized developer key is provided', () => {
    expect(() => setLicenseMode('invalid-key', { mode: 'LIVE' })).toThrow(/Invalid developer master authentication code/);
  });
});
