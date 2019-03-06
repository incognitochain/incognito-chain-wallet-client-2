import { Wallet } from "constant-chain-web-js/build/wallet";
import localforage from "localforage";

const numOfAccount = 1;
const walletName = "wallet1";

export function getPassphrase() {
  return window.sessionStorage.getItem("passphrase");
}

export function hasPassword() {
  return !!getPassphrase();
}

export function savePassword(pass) {
  window.sessionStorage.setItem("passphrase", pass);
}

export async function loadWallet() {
  const passphrase = getPassphrase();
  let wallet = new Wallet();
  wallet.Storage = localforage;

  const result = await wallet.loadWallet(passphrase);
  if (result && wallet.Name) {
    return wallet;
  }
  return false;
}

export async function initWallet() {
  const passphrase = getPassphrase();
  let wallet = new Wallet();
  wallet.Storage = localforage;
  wallet.init(passphrase, numOfAccount, walletName, localforage);
  await wallet.save(passphrase);
  return wallet;
}
