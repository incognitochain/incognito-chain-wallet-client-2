import React from "react";
import "./App.css";
import Header from "./components/layout/Header";
import Home from "./components/pages/Home";
import CreateAccount from "./components/pages/Account/Create";
import Settings from "./components/pages/Settings";
import ImportAccount from "./components/pages/Account/Import";
import Snackbar from "@material-ui/core/Snackbar";

import Account from "./services/Account";
import { AccountContext } from "./common/context/AccountContext";
import {
  Error as IconError,
  CheckCircle as IconSuccess,
  Warning as IconWarning
} from "@material-ui/icons";
import "toastr/build/toastr.css";
import toastr from "toastr";
import styled from "styled-components";
import * as walletService from "services/WalletService";

toastr.options.positionClass = "toast-bottom-center";

const initialState = {
  screen: "",
  headerTitle: "Wallet home",
  showAlert: "",
  isAlert: false,
  selectedAccount: {},
  accounts: []
};

function appReducer(state = initialState, action) {
  switch (action.type) {
    case "LOAD_ACCOUNTS":
      return {
        ...state,
        loading: true,
        accounts: []
      };
    case "LOAD_ACCOUNTS_SUCCESS":
      return {
        ...state,
        walletName: action.walletName,
        loading: false,
        selectedAccount: action.selectedAccount,
        accounts: action.accounts
      };
    case "SHOW_ALERT":
      return {
        ...state,
        isAlert: true,
        showAlert: action.showAlert
      };
    case "CLOSE_ALERT":
      return {
        ...state,
        showAlert: "",
        isAlert: false
      };
    case "SET_SCREEN":
      return {
        ...state,
        screen: action.screen,
        headerTitle: action.headerTitle
      };
    case "SET_SELECTED_ACCOUNT":
      return {
        ...state,
        selectedAccount: action.selectedAccount
      };
    case "ADD_ACCOUNT_DATA":
      return {
        ...state,
        selectedAccount: {
          ...state.selectedAccount,
          Pubkey: action.Pubkey,
          PrivateKey: action.PrivateKey // TODO -
        }
      };
    default:
      return state;
  }
}

const App = () => {
  let [state, dispatch] = React.useReducer(appReducer, initialState);

  React.useEffect(() => {
    getAccounts();
  }, []);

  const getAccounts = async () => {
    try {
      const wallet = await walletService.getWallet();
      console.log("wallet", wallet);

      const accounts = wallet.listAccount();
      const walletName = wallet.Name;
      let accountList = wallet.listAccount().map(account => ({
        default: false,
        name: account["Account Name"],
        value: 0,
        PaymentAddress: account.PaymentAddress,
        ReadonlyKey: account.ReadonlyKey
      }));

      Object.keys(accounts).forEach(a => {
        accountList.push({ default: false, name: a, value: accounts[a] });
      });
      let selectedAccount = {};
      if (accountList.length > 0) {
        let selectedAccountIndex = parseInt(
          window.localStorage.getItem("accountIndex")
        );
        if (isNaN(selectedAccountIndex)) selectedAccountIndex = 0;
        if (!accountList[selectedAccountIndex]) selectedAccountIndex = 0;
        accountList[selectedAccountIndex].default = true;
        selectedAccount = accountList[selectedAccountIndex];
      }

      dispatch({
        type: "LOAD_ACCOUNTS_SUCCESS",
        walletName,
        selectedAccount,
        accounts: accountList
      });

      dispatch({
        type: "SET_SCREEN",
        screen: <Home account={selectedAccount} />,
        headerTitle: "Home"
      });
      getAccountData(selectedAccount);
      return;
    } catch (e) {
      console.error(e);
    }
    alert("Error on get account list. Please restart app!");
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    dispatch({ type: "CLOSE_ALERT" });
  };

  const selectAccount = action => {
    let screen = "",
      headerTitle = "Home";
    if (action === "CREATE_ACCOUNT") {
      screen = (
        <CreateAccount
          onFinish={data => {
            backHome(data);
          }}
        />
      );
      headerTitle = "Account";
    } else if (action === "IMPORT_ACCOUNT") {
      screen = (
        <ImportAccount
          onFinish={data => {
            backHome(data);
          }}
        />
      );
      headerTitle = "Account";
    } else if (action === "SETTINGS") {
      screen = (
        <Settings
          onFinish={data => {
            backHome(data);
          }}
        />
      );
      headerTitle = "Settings";
    }

    dispatch({ type: "SET_SCREEN", screen, headerTitle });
  };

  const showAlert = (
    msg,
    { flag = "warning", html = false, duration = 2000, hideIcon = false }
  ) => {
    let icon = "";

    if (flag === "success") icon = <IconSuccess />;
    else if (flag === "danger") icon = <IconError />;
    else if (flag === "warning") icon = <IconWarning />;

    dispatch({
      type: "SHOW_ALERT",
      showAlert: (
        <Snackbar
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center"
          }}
          open
          autoHideDuration={duration}
          onClose={handleClose}
        >
          <div className={"alert alert-" + flag} role="alert">
            {!hideIcon && icon} {msg}
          </div>
        </Snackbar>
      )
    });
  };

  const showSuccess = msg => {
    showAlert(msg, { flag: "success", duration: 3000, hideIcon: true });
  };

  const backHome = data => {
    dispatch({ type: "SET_SCREEN", screen: <Home />, headerTitle: "Home" });

    if (data && data.message) {
      showSuccess(data.message);
    }
  };
  const handleChangeAccount = account => {
    window.localStorage.setItem(
      "accountIndex",
      state.accounts.indexOf(account)
    );
    dispatch({ type: "SET_SELECTED_ACCOUNT", selectedAccount: account });
    dispatch({
      type: "SET_SCREEN",
      screen: <Home account={account} />,
      headerTitle: "Home"
    });

    getAccountData(account);
  };

  async function getAccountData(account) {
    try {
      // TODO -
      const { PrivateKey, ...key } = await Account.getPaymentAddress(
        account.name
      );
      console.log("key", key);
      // TODO -
      const result = await Account.getPrivateKey(account.PaymentAddress);

      dispatch({
        type: "ADD_ACCOUNT_DATA",
        PrivateKey: result.PrivateKey,
        Pubkey: key.Pubkey
      });
    } catch (e) {
      alert("Error on get account data!");
    }
  }

  return (
    <Wrapper>
      {state.showAlert}

      <AccountContext.Provider value={state.selectedAccount}>
        <Header
          callbackSelected={action => {
            selectAccount(action);
          }}
          title={state.headerTitle}
          accounts={state.accounts}
          selectedAccount={state.selectedAccount}
          onChangeAccount={handleChangeAccount}
        />
        <AppContainer>{state.screen}</AppContainer>
      </AccountContext.Provider>
    </Wrapper>
  );
};

export default App;

const Wrapper = styled.div`
  background: url(assets/images/bg.png) no-repeat center center;
  margin: 0 auto;
  height: 100vh;
  width: 414px;
  overflow: auto;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
`;

const AppContainer = styled.div`
  flex: 1;
  display: flex;
`;
