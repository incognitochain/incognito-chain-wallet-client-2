import CryptoJS from 'crypto-js';
import { CONSTANT_CONFIGS, CONSTANT_KEYS } from '@src/constants';

const PASSWORD_DURATION_IN_MS = 7 * 24 * 3600 * 1000; // 7 days
const PASSWORD_SECRET_KEY = CONSTANT_CONFIGS.PASSWORD_SECRET_KEY;

export function clearPassword() {
  window.localStorage.removeItem(CONSTANT_KEYS.PASSPHRASE_KEY);
}

export function getPassphrase() {
  let pass = window.localStorage.getItem(CONSTANT_KEYS.PASSPHRASE_KEY);
  if (!pass) return;
  try {
    pass = CryptoJS.AES.decrypt(pass, PASSWORD_SECRET_KEY).toString(
      CryptoJS.enc.Utf8
    );
  } catch (e) {
    return;
  }

  const [password, expired] = pass.split(':');
  if (!password || !expired) return;

  if (Date.now() > parseInt(expired, 10)) {
    return;
  }
  return password;
}

export function hasPassword() {
  return !!getPassphrase();
}

export function savePassword(pass) {
  const expired = Date.now() + PASSWORD_DURATION_IN_MS;
  const toBeSaved = CryptoJS.AES.encrypt(
    `${pass}:${expired}`,
    PASSWORD_SECRET_KEY
  ).toString();
  window.localStorage.setItem(CONSTANT_KEYS.PASSPHRASE_KEY, toBeSaved);
}
