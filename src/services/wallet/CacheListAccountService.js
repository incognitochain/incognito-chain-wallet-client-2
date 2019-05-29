import CryptoJS from 'crypto-js';
import { CONSTANT_CONFIGS } from '@src/constants';

const CACHE_TIME = 1800 * 1000; // 30 minutes
const CACHE_SECRET_KEY = CONSTANT_CONFIGS.PASSWORD_SECRET_KEY;

export function clearListAccount() {
  window.localStorage.removeItem('accountList');
}

export function getAccountList() {
  let accountList = window.localStorage.getItem('accountList');
  if (!accountList) return;
  try {
    accountList = CryptoJS.AES.decrypt(accountList, CACHE_SECRET_KEY).toString(
      CryptoJS.enc.Utf8
    );
  } catch (e) {
    return;
  }

  const [accounts, expired] = accountList.split('****+++++*****');
  if (!accounts || !expired) return;

  if (Date.now() > parseInt(expired, 10)) {
    return;
  }
  return accounts;
}

export function hasAccountLists() {
  return !!getAccountList();
}

export function saveAccountList(accountList) {
  const expired = Date.now() + CACHE_TIME;
  const toBeSaved = CryptoJS.AES.encrypt(
    `${accountList}****+++++*****${expired}`,
    CACHE_SECRET_KEY
  ).toString();
  window.localStorage.setItem('accountList', toBeSaved);
}
