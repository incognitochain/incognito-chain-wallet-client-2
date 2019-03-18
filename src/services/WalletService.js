import { Wallet, RpcClient } from "constant-chain-web-js/build/wallet";
import localforage from "localforage";
import { getPassphrase } from "./PasswordService";
import Server from "./Server";

const numOfAccount = 1;
const walletName = "wallet1";

export async function loadWallet() {
  const server = Server.getDefault();
  console.log("[loadWallet] with server ", server);
  Wallet.RpcClient = new RpcClient(
    server.address,
    server.username,
    server.password
  );

  console.log("Wallet when load wallet:", Wallet);
  console.time("loadWallet");
  const passphrase = getPassphrase();
  let wallet = new Wallet();
  wallet.Storage = localforage;

  await wallet.loadWallet(passphrase);
  console.log("Load Wallet", wallet.MasterAccount.child);
  if (wallet.Name) {
    console.timeEnd("loadWallet");

    // get tx by hash from rpc

    return wallet;
  }
  console.timeEnd("loadWallet");
  return false;
}

export async function initWallet() {
  try {
    console.time("initWallet");
    const passphrase = getPassphrase();

    let wallet = new Wallet();
    wallet.Storage = localforage;
    wallet.init(passphrase, numOfAccount, walletName, localforage);

    await wallet.save(passphrase);
    console.timeEnd("initWallet");
    return wallet;
  } catch (e) {
    throw e;
  }
}

export function saveWallet(wallet) {
  wallet.save(getPassphrase());
}
