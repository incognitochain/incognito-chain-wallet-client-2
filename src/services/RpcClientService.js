import { Wallet, RpcClient } from "constant-chain-web-js/build/wallet";

function getRpcClient() {
  return Wallet.RpcClient;
}

export function setRpcClient(server, username, password) {
  Wallet.RpcClient = new RpcClient(server, username, password);
}

export function listCustomTokens() {
  return getRpcClient().listCustomTokens();
}

export function listPrivacyTokens() {
  return getRpcClient().listPrivacyCustomTokens();
}

export function getEstimateFee(from, to, amount) {
  // Wallet.RpcClient.getEstimateFee(from, to, amount)
  console.error("!!!!!!!!getEstimateFee is mocking!!!!!!");
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(Math.random());
    }, 500);
  });
}
