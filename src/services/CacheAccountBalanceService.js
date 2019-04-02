import CryptoJS from "crypto-js";

const CACHE_ACCOUNT_BALANCE_TIME = 1 * 60 * 1000; // 1 minutes
const CACHE_ACCOUNT_BALANCE_SECRET_KEY = "FJexuTITEw";

export function clearAllAccountBalance(accountNames, tokenID = "") {
  for (var i = 0; i < accountNames.length; i++) {
    clearAccountBalance(accountNames[i], tokenID);
  }
}

export function clearAccountBalance(accountName, tokenID = "") {
  window.localStorage.removeItem(
    (tokenID != "" ? tokenID + "-" : "") + "account-" + accountName
  );
}

export function getAccountBalance(accountName, tokenID = "") {
  let balance = window.localStorage.getItem(
    (tokenID != "" ? tokenID + "-" : "") + "account-" + accountName
  );
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
    return -1;
  }
  console.log("Get account balance from cache:", accountName, bal);
  return parseInt(bal);
}

export function hasAccountBalance(accountName, tokenID = "") {
  return getAccountBalance(accountName, tokenID) != -1;
}

export function saveAccountBalance(balance, accountName, tokenID = "") {
  const expired = Date.now() + CACHE_ACCOUNT_BALANCE_TIME;
  const toBeSaved = CryptoJS.AES.encrypt(
    `${balance}****+++++*****${expired}`,
    CACHE_ACCOUNT_BALANCE_SECRET_KEY
  ).toString();
  window.localStorage.setItem(
    (tokenID != "" ? tokenID + "-" : "") + "account-" + accountName,
    toBeSaved
  );
}
