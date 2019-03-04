import { Wallet } from "constant-chain-web-js/build/wallet";
import localforage from "localforage";

// TODO - not hardcoded below:
const passphrase = "12345678";
const numOfAccount = 1;
const walletName = "wallet1";
// ----

export async function getWallet() {
  let wallet = new Wallet();
  wallet.Storage = localforage;

  const result = await wallet.loadWallet(passphrase);

  if (result && wallet.Name) {
    return wallet;
  } else {
    wallet.init(passphrase, numOfAccount, walletName, localforage);
    await wallet.save(passphrase);
    return wallet;
  }
}
