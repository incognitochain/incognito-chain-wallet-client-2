import axios from "axios";
import Server from "./Server";
import {
  PaymentInfo,
  CustomTokenPrivacyParamTx,
  CustomTokenParamTx,
  // TxTokenVin,
  TxTokenVout,
  KeyWallet
} from "constant-chain-web-js/build/wallet";

import bn from "bn.js";
import { getPassphrase } from "./PasswordService";

export default class Token {
  static getOption(methodName, params) {
    const server = Server.getDefault();

    if (server) {
      const auth =
        "Basic " +
        new Buffer(server.username + ":" + server.password).toString("base64");
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: auth
        },
        url: server.address,
        data: {
          jsonrpc: "1.0",
          method: methodName,
          params: params,
          id: 1
        }
      };
      return options;
    } else {
      return false;
    }
  }
  static async getListCustomTokenBalance(param) {
    const response = await axios(
      Token.getOption("getlistcustomtokenbalance", param)
    );
    if (response.status === 200) {
      if (response.data && response.data.Result) return response.data.Result;
    }
    return false;
  }
  static async getListPrivacyCustomTokenBalance(param) {
    const response = await axios(
      Token.getOption("getlistprivacycustomtokenbalance", param)
    );
    if (response.status === 200) {
      if (response.data && response.data.Result) return response.data.Result;
    }
    return false;
  }

  static async createSendCustomToken(submitParam, account, wallet) {
    console.log("SEND CUSTOM TOKEN!!!!!!!");

    console.log("Wallet before create and send token: ", wallet);

    console.log("submitParam.TokenID: ", submitParam.TokenID);
    // get accountWallet from wallet has name
    // let accountWallet = wallet.getAccountByName(account.name);
    let indexAccount = wallet.getAccountIndexByName(account.name);

    // console.log("Account Wallet sender: ", accountWallet);

    // prepare param for create and send token
    // param 0: payment infos
    //todo:
    // how to get paynment address, amount from submit param?

    let paymentInfos = [];
    for (let i = 0; i < paymentInfos.length; i++) {
      paymentInfos[i] = new PaymentInfo(/*paymentAddress, amount*/);
    }

    let receiverPaymentAddrStr = new Array(1);
    receiverPaymentAddrStr[0] = submitParam.TokenReceivers.PaymentAddress;

    // param 1: token param
    // get current token to get token param
    let tokenParam = new CustomTokenParamTx();
    tokenParam.propertyID = submitParam.TokenID;
    tokenParam.propertyName = submitParam.TokenName;
    tokenParam.propertySymbol = submitParam.TokenSymbol;
    tokenParam.amount = submitParam.TokenAmount;
    tokenParam.tokenTxType = submitParam.TokenTxType;
    tokenParam.receivers = new Array(1);
    tokenParam.receivers[0] = new TxTokenVout();
    // console.log(
    //   "To address seriallize: ",
    //   submitParam.TokenReceivers.PaymentAddress
    // );

    // let receiverKey = KeyWallet.base58CheckDeserialize(
    //   submitParam.TokenReceivers.PaymentAddress
    // );
    // console.log("Payment address of receiver:", receiverKey);
    tokenParam.receivers[0].set(
      KeyWallet.base58CheckDeserialize(
        submitParam.TokenReceivers.PaymentAddress
      ).KeySet.PaymentAddress,
      submitParam.TokenReceivers.Amount
    );
    let res;
    try {
      res = await wallet.MasterAccount.child[
        indexAccount
      ].createAndSendCustomToken(
        paymentInfos,
        tokenParam,
        receiverPaymentAddrStr
      );
      console.log("Res when create and send token:", res);
      await wallet.save(getPassphrase());

      console.log("Wallet after create and send token: ", wallet);
    } catch (e) {
      console.log(e);
      throw e;
    }

    return res;
  }

  static async createSendPrivacyCustomTokenTransaction(
    submitParam,
    account,
    wallet
  ) {
    console.log("SEND PRIVACY CUSTOM TOKEN!!!!!!!");
    // get accountWallet from wallet has name
    // let accountWallet = wallet.getAccountByName(account.name);
    // console.log("Account Wallet sender: ", accountWallet);
    let indexAccount = wallet.getAccountIndexByName(account.name);

    // prepare param for create and send privacy custom token
    let paymentInfos = new Array(0);
    for (let i = 0; i < paymentInfos.length; i++) {
      paymentInfos[i] = new PaymentInfo(/*paymentAddress, amount*/);
    }

    // param 1: token param
    // get current token to get token param
    let tokenParam = new CustomTokenPrivacyParamTx();
    tokenParam.propertyID = submitParam.TokenID;
    tokenParam.propertyName = submitParam.TokenName;
    tokenParam.propertySymbol = submitParam.TokenSymbol;
    tokenParam.amount = submitParam.TokenAmount;
    tokenParam.tokenTxType = submitParam.TokenTxType;

    let receiverPaymentAddrStr = new Array(1);
    receiverPaymentAddrStr[0] = submitParam.TokenReceivers.PaymentAddress;

    tokenParam.receivers = new Array(1);
    tokenParam.receivers[0] = new PaymentInfo(
      KeyWallet.base58CheckDeserialize(
        submitParam.TokenReceivers.PaymentAddress
      ).KeySet.PaymentAddress,
      new bn(submitParam.TokenReceivers.Amount)
    );

    console.log(
      "Token param when createSendPrivacyCustomTokenTransaction: ",
      tokenParam
    );

    let response;
    try {
      response = await wallet.MasterAccount.child[
        indexAccount
      ].createAndSendPrivacyCustomToken(
        paymentInfos,
        tokenParam,
        receiverPaymentAddrStr
      );

      await wallet.save(getPassphrase());
    } catch (e) {
      throw e;
    }

    return response;
  }
}
