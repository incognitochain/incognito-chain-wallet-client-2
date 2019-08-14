import { KeyWallet, Wallet } from "incognito-chain-web-js/build/wallet";
import { getPassphrase } from "./PasswordService";
import { getActiveShard } from "./RpcClientService";

export default class Account {
  static async importAccount(privakeyStr, accountName, passPhrase, wallet) {
    // console.log("Wallet when import account: ", wallet);

    let account;
    try {
      account = wallet.importAccount(privakeyStr, accountName, passPhrase);
    } catch (e) {
      console.log("Error when importing account: ", e);
      return false;
    }

    if (account.isImport === false) {
      console.log("Account is not imported");
      return false;
    } else {
      console.log("Account is imported");
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

  static async sendConstant(param, fee, isPrivacy, account, wallet, info) {
    // param: payment address string, amount in Number (miliconstant)
    await Wallet.resetProgressTx();
    let indexAccount = wallet.getAccountIndexByName(account.name);
    // create and send constant
    let result;
    try {
      result = await wallet.MasterAccount.child[
        indexAccount
      ].createAndSendConstant(param, fee, isPrivacy, info);

      console.log(
        "Spendingcoin after sendConstant: ",
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

  static async staking(
    param,
    fee,
    candidatePaymentAddress,
    isRewardFunder,
    account,
    wallet
  ) {
    // param: payment address string, amount in Number (miliconstant)
    await Wallet.resetProgressTx();
    let indexAccount = wallet.getAccountIndexByName(account.name);
    // create and send constant
    let result;
    try {
      result = await wallet.MasterAccount.child[
        indexAccount
      ].createAndSendStakingTx(
        param,
        fee,
        candidatePaymentAddress,
        isRewardFunder
      );

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
    let shardID = process.env.SHARD_ID;
    if (
      process.env.SHARD_ID &&
      (parseInt(process.env.SHARD_ID) >= parseInt(activeShardNumber) ||
        parseInt(process.env.SHARD_ID) < 0)
    ) {
      shardID = Math.floor(Math.random() * (activeShardNumber - 1));
    }

    return wallet.createNewAccount(accountName, shardID);
  }

  // get progress tx
  static getProgressTx() {
    console.log("Wallet.progressTx: ", Wallet.ProgressTx);
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

  static async cancelTx(txID, newFee, newFeePToken, account, wallet) {
    // let accountWallet = wallet.getAccountByName(account.name);
    console.log("Account: ", account);
    console.log("wallet: ", wallet);

    let indexAccount = wallet.getAccountIndexByName(account.name);
    let result;
    try {
      result = await wallet.MasterAccount.child[indexAccount].cancelTx(
        txID,
        newFee,
        newFeePToken
      );

      // save wallet
      wallet.save(getPassphrase());
    } catch (e) {
      throw e;
    }

    return result;
  }

  /**
   *
   * @param {string} tokenID
   * @param {object} account
   * @param {object} wallet
   */
  static async getRewardAmount(tokenID, account, wallet) {
    let indexAccount = wallet.getAccountIndexByName(account.name);
    let result;
    try {
      result = await wallet.MasterAccount.child[indexAccount].getRewardAmount(
        tokenID
      );
    } catch (e) {
      throw e;
    }

    return result;
  }
  /**
   *
   * @param {string} tokenID
   * @param {object} account
   * @param {object} wallet
   */
  static async createAndSendWithdrawRewardTx(tokenID, account, wallet) {
    let indexAccount = wallet.getAccountIndexByName(account.name);
    let result;
    try {
      result = await wallet.MasterAccount.child[
        indexAccount
      ].createAndSendWithdrawRewardTx(tokenID);
    } catch (e) {
      throw e;
    }

    return result;
  }

  /**
   *
   * @param {object} accountWallet
   */
  static toSerializedAccountObj(accountWallet) {
    return accountWallet.toSerializedAccountObj();
  }
}
