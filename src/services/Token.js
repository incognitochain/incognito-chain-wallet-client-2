import {
  PaymentInfo,
  CustomTokenPrivacyParamTx,
  CustomTokenParamTx,
  TxTokenVout,
  KeyWallet
} from "constant-chain-web-js/build/wallet";
import bn from "bn.js";
import { getPassphrase } from "./PasswordService";

export default class Token {
  static async createSendCustomToken(submitParam, account, wallet) {
    console.log("SEND CUSTOM TOKEN!!!!!!!");

    // get index account by name
    let indexAccount = wallet.getAccountIndexByName(account.name);

    // prepare param for create and send token
    // payment info
    // @@ Note: it is use for receivers constant
    let paymentInfos = [];
    // for (let i = 0; i < paymentInfos.length; i++) {
    //   paymentInfos[i] = new PaymentInfo(/*paymentAddress, amount*/);
    // }

    // receviers token
    let receiverPaymentAddrStr = new Array(1);
    receiverPaymentAddrStr[0] = submitParam.TokenReceivers.PaymentAddress;

    // token param
    let tokenParam = new CustomTokenParamTx();
    tokenParam.propertyID = submitParam.TokenID;
    tokenParam.propertyName = submitParam.TokenName;
    tokenParam.propertySymbol = submitParam.TokenSymbol;
    tokenParam.amount = submitParam.TokenAmount;
    tokenParam.tokenTxType = submitParam.TokenTxType;
    tokenParam.receivers = new Array(1);
    tokenParam.receivers[0] = new TxTokenVout();
    tokenParam.receivers[0].set(
      KeyWallet.base58CheckDeserialize(
        submitParam.TokenReceivers.PaymentAddress
      ).KeySet.PaymentAddress,
      submitParam.TokenReceivers.Amount
    );

    // create and send custom token
    let res;
    try {
      res = await wallet.MasterAccount.child[
        indexAccount
      ].createAndSendCustomToken(
        paymentInfos,
        tokenParam,
        receiverPaymentAddrStr
      );

      // saving KeyWallet
      await wallet.save(getPassphrase());
    } catch (e) {
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

    // get index account by name
    let indexAccount = wallet.getAccountIndexByName(account.name);

    // prepare param for create and send privacy custom token
    // payment info
    // @@ Note: it is use for receivers constant
    let paymentInfos = [];
    // for (let i = 0; i < paymentInfos.length; i++) {
    //   paymentInfos[i] = new PaymentInfo(/*paymentAddress, amount*/);
    // }

    // token param
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
