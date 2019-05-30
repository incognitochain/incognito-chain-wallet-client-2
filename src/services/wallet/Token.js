import {
  CustomTokenParamTx,
  TxTokenVout,
  KeyWallet,
  Wallet
} from 'constant-chain-web-js/build/wallet';
import { getPassphrase } from './PasswordService';
import { listPrivacyTokens } from './RpcClientService';

export default class Token {
  static async createSendCustomToken(submitParam, fee, account, wallet) {
    await Wallet.resetProgressTx();
    console.log('SEND CUSTOM TOKEN!!!!!!!');

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

    console.log(tokenParam);
    // create and send custom token
    let res;
    try {
      res = await wallet.MasterAccount.child[
        indexAccount
      ].createAndSendCustomToken(
        paymentInfos,
        tokenParam,
        receiverPaymentAddrStr,
        fee
      );

      // saving KeyWallet
      await wallet.save(getPassphrase());
      console.log('HHHHHH Wallet after createSendCustomToken : ', wallet);
    } catch (e) {
      throw e;
    }

    await Wallet.resetProgressTx();
    return res;
  }

  static async createSendPrivacyCustomTokenTransaction(
    submitParam,
    fee,
    account,
    wallet
  ) {
    await Wallet.resetProgressTx();
    console.log('SEND PRIVACY CUSTOM TOKEN!!!!!!!');

    // get index account by name
    let indexAccount = wallet.getAccountIndexByName(account.name);

    // prepare param for create and send privacy custom token
    // payment info
    // @@ Note: it is use for receivers constant
    let paymentInfos = [];
    // for (let i = 0; i < paymentInfos.length; i++) {
    //   paymentInfos[i] = new PaymentInfo(/*paymentAddress, amount*/);
    // }
    let response;
    try {
      response = await wallet.MasterAccount.child[
        indexAccount
      ].createAndSendPrivacyCustomToken(paymentInfos, submitParam, fee);

      await wallet.save(getPassphrase());
    } catch (e) {
      throw e;
    }

    await Wallet.resetProgressTx();

    return response;
  }

  static async getPrivacyTokens() {
    try {
      const data = await listPrivacyTokens();
      
      if (data?.err) {
        throw data.err;
      }

      const tokens = data?.listPrivacyToken || [];

      return tokens;
    } catch (e) {
      throw e;
    }
  }
}
