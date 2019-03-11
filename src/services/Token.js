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
  static async createSendPrivacyCustomTokenTransaction(param, account, wallet) {
    console.log("SEND PRIVACY CUSTOM TOKEN!!!!!!!");
    // get accountWallet from wallet has name
    let accountWallet = wallet.getAccountByName(account.name);

    console.log("Account Wallet sender: ", accountWallet);

    // prepare param for create and send token
    // param 0: payment infos
    //todo:
    // how to get paynment address, amount from submit param?

    let paymentInfos = new Array(0);
    for (let i = 0; i < paymentInfos.length; i++) {
      paymentInfos[i] = new PaymentInfo(/*paymentAddress, amount*/);
    }

    // param 1: token param
    // get current token to get token param
    let tokenParam = new CustomTokenPrivacyParamTx();
    tokenParam.propertyID = "";
    tokenParam.propertyName = "";
    tokenParam.propertySymbol = "";
    tokenParam.amount = 0;
    tokenParam.tokenTxType = 0;
    tokenParam.receivers = [];

    for (let i = 0; i < tokenParam.receivers.length; i++) {
      tokenParam.receivers[i] = new PaymentInfo(/*paymentADDR, amount*/);
    }

    await accountWallet.createAndSendPrivacyCustomToken(
      paymentInfos,
      tokenParam
    );

    // param.splice(1, 0, null)
    // const response = await axios(Token.getOption("createandsendprivacycustomtokentransaction", param));
    // if (response.status === 200) {
    //   if (response.data && response.data.Result)
    //     return response.data.Result;
    // }
    // return false;
  }

  static async createSendCustomToken(submitParam, account, wallet) {
    console.log("SEND CUSTOM TOKEN!!!!!!!");

    console.log("submitParam.TokenID: ", submitParam.TokenID);
    // get accountWallet from wallet has name
    let accountWallet = wallet.getAccountByName(account.name);

    console.log("Account Wallet sender: ", accountWallet);

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
    // for (let i=0; i<receiverPaymentAddrStr.length; i++){
    //   receiverPaymentAddrStr[i] = submitParam.TokenReceivers.PaymentAddress
    // }

    // param 1: token param
    // get current token to get token param
    let tokenParam = new CustomTokenParamTx();
    tokenParam.propertyID = submitParam.TokenID;
    tokenParam.propertyName = submitParam.TokenName;
    tokenParam.propertySymbol = submitParam.TokenSymbol;
    tokenParam.amount = submitParam.TokenAmount * 100;
    tokenParam.tokenTxType = submitParam.TokenTxType;
    tokenParam.receivers = new Array(1);
    tokenParam.receivers[0] = new TxTokenVout();
    console.log(
      "To address seriallize: ",
      submitParam.TokenReceivers.PaymentAddress
    );


    let receiverKey = KeyWallet.base58CheckDeserialize(
      submitParam.TokenReceivers.PaymentAddress
    );
    console.log("Payment address of receiver:", receiverKey);
    tokenParam.receivers[0].set(
      receiverKey.KeySet.PaymentAddress,
      submitParam.TokenReceivers.Amount * 100
    );
    let res;
    try {
      res = await accountWallet.createAndSendCustomToken(
        paymentInfos,
        tokenParam,
        receiverPaymentAddrStr
      );
      console.log("Res when create and send token:", res);
    } catch (e) {
      console.log(e);
      throw e;
    }

    return res;

    // param.splice(1, 0, null)
    // const response = await axios(Token.getOption("createandsendcustomtokentransaction", param));
    // if (response.status === 200) {
    //   if (response.data && response.data.Result)
    //     return response.data.Result;
    // }
    // return false;
  }
}
