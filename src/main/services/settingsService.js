import { getSetting, setSetting, getAllSettings } from '../repositories/settingsRepository.js';

export function fetchAppSettings() {
  return getAllSettings();
}

export function saveAppSetting(key, value) {
  setSetting(key, value);
  return { key, value };
}

export function getAppSetting(key, defaultValue) {
  return getSetting(key, defaultValue);
}
