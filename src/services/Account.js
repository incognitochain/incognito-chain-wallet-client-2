import axios from "axios";
import Server from "./Server";

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

  // how we get account wallet object
  // todo: accountWallet ???
  static async sendConstant(param, account, wallet) {

    // get accountWallet from wallet has name
    let accountWallet = wallet.getAccountByName(account.name);

    console.log("Account Wallet sender: ", accountWallet);

    let result = await accountWallet.createAndSendConstant(param);
    if (result.err == null && result.txId) {
      return result.txId;
    } else {
      console.log("ERR when create and send constants");
      return null;
    }

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
