import CryptoJS from "crypto-js";

const CACHE_ACCOUNT_BALANCE_TIME = 10 * 1000; // 30 minutes
const CACHE_ACCOUNT_BALANCE_SECRET_KEY = "FJexuTITEw";

export function clearAllAccountBalance(accountNames) {
  for (var i = 0; i < accountNames.length; i++) {
    clearAccountBalance(accountNames[i]);
  }
}

export function clearAccountBalance(accountName) {
  window.localStorage.removeItem("account-" + accountName);
}

export function getAccountBalance(accountName) {
  let balance = window.localStorage.getItem("account-" + accountName);
  if (!balance) return -1;
  try {
    balance = CryptoJS.AES.decrypt(
      balance,
      CACHE_ACCOUNT_BALANCE_SECRET_KEY
    ).toString(CryptoJS.enc.Utf8);
  } catch (e) {
    return -1;
  }

  const [bal, expired] = balance.split("****+++++*****");
  if (!bal || !expired) return -1;

  if (Date.now() > parseInt(expired, 10)) {
    return;
  }
  console.log("Get account balance from cache:", accountName, bal);
  return parseInt(bal);
}

export function hasAccountBalance(accountName) {
  return getAccountBalance(accountName) != -1;
}

export function saveAccountBalance(balance, accountName) {
  const expired = Date.now() + CACHE_ACCOUNT_BALANCE_TIME;
  const toBeSaved = CryptoJS.AES.encrypt(
    `${balance}****+++++*****${expired}`,
    CACHE_ACCOUNT_BALANCE_SECRET_KEY
  ).toString();
  window.localStorage.setItem("account-" + accountName, toBeSaved);
}
