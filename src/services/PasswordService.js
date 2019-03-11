import CryptoJS from "crypto-js";
const PASSWORD_DURATION_IN_MS = 7 * 24 * 3600 * 1000; // 7 days
const PASSWORD_SECRET_KEY = "FJexuTITEw";

export function clearPassword() {
  window.localStorage.removeItem("passphrase");
}

export function getPassphrase() {
  let pass = window.localStorage.getItem("passphrase");
  if (!pass) return;
  try {
    pass = CryptoJS.AES.decrypt(pass, PASSWORD_SECRET_KEY).toString(
      CryptoJS.enc.Utf8
    );
  } catch (e) {
    return;
  }

  const [password, expired] = pass.split(":");
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
  window.localStorage.setItem("passphrase", toBeSaved);
}
