import axios from "axios";
import Server from "./Server";
import { KeyWallet, PaymentInfo } from "constant-chain-web-js/build/wallet";
import bn from "bn.js";

import { getPassphrase } from "./PasswordService";

// @depricated
export default class Account {
  static getOption(method, params) {
    const server = Server.getDefault();

    if (server) {
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        auth: {
          username: server.username,
          password: server.password
        },
        url: server.address,
        data: {
          jsonrpc: "1.0",
          method: method,
          params: params,
          id: 1
        }
      };

      return options;
    } else {
      return false;
    }
  }

  static async getPaymentAddress(param) {
    const response = await axios(Account.getOption("getaccountaddress", param));
    if (response.status === 200) {
      if (response.data && response.data.Result) return response.data.Result;
    }
    return false;
  }

  // todo: thunderbird
  static async getEstimateFee(param) {
    try {
      return await axios(Account.getOption("estimatefee", param));
    } catch (e) {
      console.error(e);
      return e.response;
    }
  }

  static async getBalance(param) {
    try {
      const response = await axios(Account.getOption("getbalance", param));
      if (response.status === 200) {
        if (response.data && response.data.Result) return response.data.Result;
      }
    } catch (e) {
      return { error: true, message: e.message };
    }

    return false;
  }

  static async importAccount(privakeyStr, accountName, passPhrase, wallet) {
    // console.log("Wallet when import account: ", wallet);
    let account = wallet.importAccount(privakeyStr, accountName, passPhrase);

    console.log("Account is imported: ", account);
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
    // debugger

    // get accountWallet from wallet has name
    // let accountWallet = wallet.getAccountByName(account.name);
    let indexAccount = wallet.getAccountIndexByName(account.name);

    // console.log("Account Wallet sender: ", accountWallet);

    console.log("KeyWallet ", KeyWallet);
    console.log("PaymentInfo ", PaymentInfo);

    // create paymentInfos
    let paymentInfos = new Array(param.length);
    let receiverPaymentAddrStr = new Array(param.length);

    for (let i = 0; i < paymentInfos.length; i++) {
      let keyWallet = KeyWallet.base58CheckDeserialize(
        param[i].paymentAddressStr
      );
      receiverPaymentAddrStr[i] = param[i].paymentAddressStr;
      // console.log("Payment addr:", paymentAddr);
      paymentInfos[i] = new PaymentInfo(
        keyWallet.KeySet.PaymentAddress,
        new bn(param[i].amount)
      );
    }

    let result;
    try {
      result = await wallet.MasterAccount.child[
        indexAccount
      ].createAndSendConstant(paymentInfos, receiverPaymentAddrStr);
      wallet.save(getPassphrase());
      console.log("Wallet after saving history tx: ", wallet);
    } catch (e) {
      throw e;
    }

    return result;
  }

  static async createAccount(accountName, wallet) {
    const result = wallet.createNewAccount(accountName);
    console.log("Result create account: ", result);
    return result;
  }

  static async getSealerKey(param) {
    const response = await axios(
      Account.getOption("createproducerkeyset", param)
    );
    if (response.status === 200) {
      if (response.data && response.data.Result) return response.data.Result;
    }
    return false;
  }
}
