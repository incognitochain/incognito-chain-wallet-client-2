import { KeyWallet, Wallet } from "constant-chain-web-js/build/wallet";
import { getPassphrase } from "./PasswordService";

export default class Account {
  static async importAccount(privakeyStr, accountName, passPhrase, wallet) {
    // console.log("Wallet when import account: ", wallet);
    let account = wallet.importAccount(privakeyStr, accountName, passPhrase);

    if (account.isImport === false) {
      console.log("Account is not imported");
      return false;
    } else {
      console.log("Account is imported");
      return true;
    }
  }

  static async removeAccount(privateKeyStr, accountName, passPhrase, wallet) {
    try {
      let result = wallet.removeAccount(privateKeyStr, accountName, passPhrase);
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

  // create new account
  static async createAccount(accountName, wallet) {
    return wallet.createNewAccount(accountName);
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
}
