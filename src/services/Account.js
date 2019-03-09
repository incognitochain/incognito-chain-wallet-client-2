import axios from "axios";
import Server from "./Server";
import {KeyWallet, PaymentInfo} from "constant-chain-web-js/build/wallet";
import bn from 'bn.js';
// import * as ec from 'privacy-js-lib/lib/ec';
// import * as privacyUtils from 'privacy-js-lib/lib/privacy_utils';


// console.time("Big int");
// let a = new bn(10);

// function test() {
//   let G = ec.P256.randomize();
//   let rand =privacyUtils.randScalar();
//
//   console.time("Test scalar: ");
//   let H = G.mul(rand);
//   console.timeEnd("Test scalar: ");
//
//   console.log("H: ", H);
// }
//
// window._test = test

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
    try{
      let result = wallet.removeAccount(privateKeyStr, accountName, passPhrase);
      return result;

    } catch (e) {
      return e
    }

    // try {
    //   const response = await axios(Account.getOption("removeaccount", param));
    //   if (response.status === 200) {
    //     if (response.data && response.data.Result) return response.data.Result;
    //   }
    // } catch (e) {
    //   return { error: true, message: e.message };
    // }
    //
    // return false;
  }

  static async registerCandidate(param) {
    try {
      const response = await axios(
        Account.getOption("sendregistration", param)
      );
      if (response.status === 200) {
        if (response.data && response.data.Result) return response.data.Result;
      }
    } catch (e) {
      return { error: true, message: e.message };
    }

    return false;
  }

  static async sendConstant(param, account, wallet) {
    // debugger

    // get accountWallet from wallet has name
    let accountWallet = wallet.getAccountByName(account.name);

    console.log("Account Wallet sender: ", accountWallet);

    console.log("KeyWallet ", KeyWallet);
    console.log("PaymentInfo ", PaymentInfo);

    // create paymentInfos
    let paymentInfos = new Array(param.length);
    for (let i=0; i<paymentInfos.length; i++){
      let keyWallet = KeyWallet.base58CheckDeserialize(param[i].paymentAddressStr);
      // console.log("Payment addr:", paymentAddr);
      paymentInfos[i] = new PaymentInfo(keyWallet.KeySet.PaymentAddress, new bn(param[i].amount));
    }

    let result = await accountWallet.createAndSendConstant(paymentInfos);

    return result;

    // console.log("Result create and send tx: ", result);
    // if (result.err == null && result.txId) {
    //   return result.txId;
    // } else {
    //   console.log("ERR when create and send constants");
    //   return null;
    // }

    // try {
    //   const response = await axios(
    //     Account.getOption("createandsendtransaction", param)
    //   );
    //   if (response.status === 200) {
    //     if (response.data && response.data.Result) return response.data.Result;
    //   }
    // } catch (e) {
    //   return { error: true, message: e.message };
    // }
    //
    // return false;
  }

  static async createAccount(accountName, wallet) {
    const result = wallet.createNewAccount(accountName);
    console.log("Result create account: ", result);
    return result;

    // if (result !== null){
    //   return result;
    // } else{
    //   return null
    // }

    // const response = await axios(
    //   Account.getOption("getaccountaddress", accountName)
    // );
    // if (response.status === 200) {
    //   if (response.data && response.data.Result) return response.data.Result;
    // }
    // return false;
    // } catch (e) {

    //   return { error: true, message: e.message };
    // }
  }

  // static async getAccountList(param) {
  //   try {
  //     const response = await axios(Account.getOption("listaccounts", param));
  //
  //     if (response.status === 200) {
  //       if (response.data && response.data.Result) return response.data.Result;
  //     }
  //   } catch (e) {
  //     console.error(e);
  //     return false;
  //   }
  //   return false;
  // }

  static async getSealerKey(param) {
    const response = await axios(
      Account.getOption("createproducerkeyset", param)
    );
    if (response.status === 200) {
      if (response.data && response.data.Result) return response.data.Result;
    }
    return false;
  }

  static async getPrivateKey(param) {
    const response = await axios(Account.getOption("dumpprivkey", param));
    if (response.status === 200) {
      if (response.data && response.data.Result) return response.data.Result;
    }
    return false;
  }
}
