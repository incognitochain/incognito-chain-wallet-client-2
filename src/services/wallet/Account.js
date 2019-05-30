import { KeyWallet, Wallet } from 'constant-chain-web-js/build/wallet';
import { CONSTANT_CONFIGS, CONSTANT_KEYS } from '@src/constants';
import tokenModel from '@src/models/token';
import { getPassphrase } from './PasswordService';
import { getActiveShard } from './RpcClientService';
import localStorage from './localStore';

export default class Account {
  static async importAccount(privakeyStr, accountName, passPhrase, wallet) {
    // console.log("Wallet when import account: ", wallet);

    let account;
    try {
      account = wallet.importAccount(privakeyStr, accountName, passPhrase);
    } catch (e) {
      console.log('Error when importing account: ', e);
      return false;
    }

    if (account.isImport === false) {
      console.log('Account is not imported');
      return false;
    } else {
      console.log('Account is imported');
      return true;
    }
  }

  static async removeAccount(privateKeyStr, passPhrase, wallet) {
    try {
      let result = wallet.removeAccount(privateKeyStr, passPhrase);
      return result;
    } catch (e) {
      return e;
    }
  }

  static async sendConstant(param, fee, isPrivacy, account, wallet) {
    // param: payment address string, amount in Number (miliconstant)
    await Wallet.resetProgressTx();
    let indexAccount = wallet.getAccountIndexByName(account.name);
    // create and send constant
    let result;
    try {
      result = await wallet.MasterAccount.child[
        indexAccount
      ].createAndSendConstant(param, fee, isPrivacy);

      console.log(
        'Spendingcoin after sendConstant: ',
        wallet.MasterAccount.child[indexAccount].spendingCoins
      );

      // save wallet
      wallet.save(getPassphrase());
    } catch (e) {
      throw e;
    }
    await Wallet.resetProgressTx();
    return result;
  }

  static async staking(param, fee, account, wallet) {
    // param: payment address string, amount in Number (miliconstant)
    await Wallet.resetProgressTx();
    let indexAccount = wallet.getAccountIndexByName(account.name);
    // create and send constant
    let result;
    try {
      result = await wallet.MasterAccount.child[
        indexAccount
      ].createAndSendStakingTx(param, fee);

      // save wallet
      wallet.save(getPassphrase());
    } catch (e) {
      throw e;
    }
    await Wallet.resetProgressTx();
    return result;
  }

  static async defragment(amount, fee, isPrivacy, account, wallet) {
    // param: payment address string, amount in Number (miliconstant)
    await Wallet.resetProgressTx();
    let indexAccount = wallet.getAccountIndexByName(account.name);
    // create and send constant
    let result;
    try {
      result = await wallet.MasterAccount.child[indexAccount].defragment(
        amount,
        fee,
        isPrivacy
      );

      // save wallet
      wallet.save(getPassphrase());
    } catch (e) {
      await Wallet.resetProgressTx();
      throw e;
    }
    await Wallet.resetProgressTx();
    return result;
  }

  // create new account
  static async createAccount(accountName, wallet) {
    let activeShardNumber = await getActiveShard();
    let shardID = CONSTANT_CONFIGS.SHARD_ID;
    if (CONSTANT_CONFIGS.SHARD_ID) {
      shardID = Math.floor(Math.random() * (activeShardNumber - 1));
    }

    return wallet.createNewAccount(accountName, shardID);
  }

  // get progress tx
  static getProgressTx() {
    console.log('Wallet.progressTx: ', Wallet.ProgressTx);
    return Wallet.ProgressTx;
  }

  static checkPaymentAddress(paymentAddrStr) {
    let key;
    try {
      key = KeyWallet.base58CheckDeserialize(paymentAddrStr);
    } catch (e) {
      return false;
    }

    if (key.KeySet.PaymentAddress === null) {
      return false;
    } else {
      return true;
    }
  }

  static async getDefaultAccountName() {
    return localStorage.get(CONSTANT_KEYS.DEFAULT_ACCOUNT_NAME);
  }

  static saveDefaultAccountToStorage(accountName) {
    return localStorage.save(CONSTANT_KEYS.DEFAULT_ACCOUNT_NAME, accountName);
  }

  static async getBalance(account, wallet){
    const indexAccount = wallet.getAccountIndexByName(account.name);
    return await wallet.MasterAccount.child[
      indexAccount
    ].getBalance();
  }

  static async getFollowingTokens(account, wallet){
    const indexAccount = wallet.getAccountIndexByName(account.name);
    return wallet.MasterAccount.child[indexAccount].listFollowingTokens()?.map(tokenModel.fromJson);
  }

  static async addFollowingTokens(tokens, account, wallet){
    const indexAccount = wallet.getAccountIndexByName(account.name);
    await wallet.MasterAccount.child[indexAccount].addFollowingToken(...tokens);
  }

  static async removeFollowingToken(tokenId, account, wallet){
    const indexAccount = wallet.getAccountIndexByName(account.name);
    await wallet.MasterAccount.child[indexAccount].removeFollowingToken(tokenId);
  }
}
