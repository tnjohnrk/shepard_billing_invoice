import { getSetting, setSetting } from '../repositories/settingsRepository.js';
import { DEVELOPER_MASTER_KEY, isDeveloperKey } from './pinService.js';

export function getLicenseStatus() {
  const mode = getSetting('license_mode', 'LIVE'); // Default to LIVE on first install
  const startDateTime = getSetting('trial_start_datetime', null);
  const endDateTime = getSetting('trial_end_datetime', null);

  if (mode === 'LIVE') {
    return {
      mode: 'LIVE',
      isLive: true,
      isTest: false,
      isExpired: false,
      startDateTime: null,
      endDateTime: null,
      remainingMs: null,
      remainingDays: null,
      remainingHours: null,
      remainingMinutes: null,
      statusMessage: 'Permanently Activated (Live Mode)'
    };
  }

  // TEST / TRIAL MODE
  const now = new Date();
  const endDate = endDateTime ? new Date(endDateTime) : null;
  const startDate = startDateTime ? new Date(startDateTime) : null;

  if (!endDate || isNaN(endDate.getTime())) {
    // If no valid end date was configured, default to not expired
    return {
      mode: 'TEST',
      isLive: false,
      isTest: true,
      isExpired: false,
      startDateTime: startDateTime,
      endDateTime: endDateTime,
      remainingMs: null,
      remainingDays: null,
      remainingHours: null,
      remainingMinutes: null,
      statusMessage: 'Test Mode Active'
    };
  }

  const diffMs = endDate.getTime() - now.getTime();
  const isExpired = diffMs <= 0;

  let remainingDays = 0;
  let remainingHours = 0;
  let remainingMinutes = 0;

  if (!isExpired) {
    remainingDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    remainingHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    remainingMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  }

  return {
    mode: 'TEST',
    isLive: false,
    isTest: true,
    isExpired,
    startDateTime,
    endDateTime,
    remainingMs: isExpired ? 0 : diffMs,
    remainingDays,
    remainingHours,
    remainingMinutes,
    statusMessage: isExpired ? 'Trial Period Expired' : `Test Mode (${remainingDays}d ${remainingHours}h remaining)`
  };
}

export function setLicenseMode(developerKey, { mode = 'LIVE', startDateTime = null, endDateTime = null }) {
  if (!isDeveloperKey(developerKey)) {
    throw new Error('Invalid developer master authentication code.');
  }

  if (mode === 'LIVE') {
    setSetting('license_mode', 'LIVE');
    setSetting('trial_start_datetime', '');
    setSetting('trial_end_datetime', '');
    return getLicenseStatus();
  }

  if (mode === 'TEST') {
    const start = startDateTime || new Date().toISOString();
    let end = endDateTime;
    if (!end) {
      // Default to 14 days from now if not specified
      const defaultEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
      end = defaultEnd.toISOString();
    }

    setSetting('license_mode', 'TEST');
    setSetting('trial_start_datetime', start);
    setSetting('trial_end_datetime', end);
    return getLicenseStatus();
  }

  throw new Error(`Unsupported license mode: ${mode}`);
}
