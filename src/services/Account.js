import axios from "axios";
import Server from "./Server";

export default class Account {
  static getOption(method, params) {
    const server = Server.getDefault();

    console.log(
      "server",
      method,
      server.username,
      server.password,
      "Basic " +
        new Buffer(server.username + ":" + server.password).toString("base64")
    );
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

  static async importAccount(param) {
    try {
      const response = await axios(Account.getOption("importaccount", param));
      if (response.status === 200) {
        if (response.data && response.data.Result) return response.data.Result;
      }
    } catch (e) {
      return { error: true, message: e.message };
    }

    return false;
  }

  static async removeAccount(param) {
    try {
      const response = await axios(Account.getOption("removeaccount", param));
      if (response.status === 200) {
        if (response.data && response.data.Result) return response.data.Result;
      }
    } catch (e) {
      return { error: true, message: e.message };
    }

    return false;
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

  static async sendConstant(param) {
    try {
      const response = await axios(
        Account.getOption("createandsendtransaction", param)
      );
      if (response.status === 200) {
        if (response.data && response.data.Result) return response.data.Result;
      }
    } catch (e) {
      return { error: true, message: e.message };
    }

    return false;
  }

  static async createAccount(param) {
    try {
      const response = await axios(
        Account.getOption("getaccountaddress", param)
      );
      if (response.status === 200) {
        if (response.data && response.data.Result) return response.data.Result;
      }
      return false;
    } catch (e) {
      return { error: true, message: e.message };
    }
  }

  static async getAccountList(param) {
    try {
      const response = await axios(Account.getOption("listaccounts", param));
      console.log("response", response);
      if (response.status === 200) {
        if (response.data && response.data.Result) return response.data.Result;
      }
    } catch (e) {
      console.error(e);
      return false;
    }
    return false;
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

  static async getPrivateKey(param) {
    const response = await axios(Account.getOption("dumpprivkey", param));
    if (response.status === 200) {
      if (response.data && response.data.Result) return response.data.Result;
    }
    return false;
  }
}
