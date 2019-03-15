import {
  KeyWallet,
  PaymentInfo,
  AccountWallet,
  Wallet
} from "constant-chain-web-js/build/wallet";
import { getPassphrase } from "./PasswordService";
import bn from "bn.js";

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

  static async sendConstant(param, account, wallet) {
    await Wallet.resetProgressTx();
    let indexAccount = wallet.getAccountIndexByName(account.name);

    // create paymentInfos
    let paymentInfos = new Array(param.length);
    let receiverPaymentAddrStr = new Array(param.length);

    for (let i = 0; i < paymentInfos.length; i++) {
      let keyWallet = KeyWallet.base58CheckDeserialize(
        param[i].paymentAddressStr
      );
      receiverPaymentAddrStr[i] = param[i].paymentAddressStr;
      paymentInfos[i] = new PaymentInfo(
        keyWallet.KeySet.PaymentAddress,
        new bn(param[i].amount)
      );
    }

    // create and send constant
    let result;
    try {
      result = await wallet.MasterAccount.child[
        indexAccount
      ].createAndSendConstant(paymentInfos, receiverPaymentAddrStr);

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
}
