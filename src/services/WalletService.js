import { Wallet, RpcClient } from "constant-chain-web-js/build/wallet";
import localforage from "localforage";
import { getPassphrase } from "./PasswordService";
import Server from "./Server";
import { getMaxShardNumber, getActiveShard } from "./RpcClientService";

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

  try {
    Wallet.ShardNumber = await getMaxShardNumber();
    console.log("Wallet.ShardNumber: ", Wallet.ShardNumber);
  } catch (e) {
    console.log(e);
  }

  console.log("Wallet when load wallet:", Wallet);
  console.time("loadWallet");
  const passphrase = getPassphrase();

  console.log(" aaaaaaaa passphrase: ", passphrase);
  let wallet = new Wallet();
  wallet.Storage = localforage;

  await wallet.loadWallet(passphrase);

  if (wallet.Name) {
    console.timeEnd("loadWallet");
    wallet.Storage = localforage;
    // update status history
    await updateStatusHistory(wallet);
    wallet.updateSpendingList();

    // console.log("wallet.MasterAccount.child[0].spentCoinCached: ", wallet.MasterAccount.child[0].spentCoinCached);
    // console.log("wallet.MasterAccount.child[1].spentCoinCached: ", wallet.MasterAccount.child[1].spentCoinCached);
    // console.log("wallet.MasterAccount.child[2].spentCoinCached: ", wallet.MasterAccount.child[2].spentCoinCached);
    console.log("HHHHH Wallet after loading: ", wallet);
    return wallet;
  }
  console.timeEnd("loadWallet");

  return false;
}

export async function loadAccountsCached(wallet, accName = null) {
  await wallet.loadAccountsCached(accName);
}

export async function initWallet() {
  try {
    console.time("initWallet");
    const passphrase = getPassphrase();

    let wallet = new Wallet();
    wallet.Storage = localforage;

    let activeShardNumber = await getActiveShard();
    let shardID = process.env.SHARD_ID;
    if (process.env.SHARD_ID) {
      shardID = Math.floor(Math.random() * (activeShardNumber - 1));
    }

    wallet.init(passphrase, numOfAccount, walletName, localforage, shardID);

    // wallet.updateSpendingList();

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

export async function updateStatusHistory(wallet) {
  console.log("UPDATING HISTORY STATUS....");
  await wallet.updateStatusHistory();
  console.log("wallet.Storage", wallet.Storage);
  wallet.save(getPassphrase());
}

export function clearCache(wallet) {
  wallet.clearCached();
}
