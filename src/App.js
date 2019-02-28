import React from "react";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import "./App.css";
import Header from "./components/layout/Header";
import Home from "./components/pages/Home";
import CreateAccount from "./components/pages/Account/Create";
import Settings from "./components/pages/Settings";
import ImportAccount from "./components/pages/Account/Import";
import Snackbar from "@material-ui/core/Snackbar";
import Server from "./services/Server";

import Account from "./services/Account";
import { AccountContext } from "./common/context/AccountContext";
import {
  Error as IconError,
  CheckCircle as IconSuccess,
  Warning as IconWarning
} from "@material-ui/icons";
import "toastr/build/toastr.css";

const theme = createMuiTheme({
  palette: {
    primary: {
      light: "#6396ef",
      main: "#2469bc",
      dark: "#003f8b",
      contrastText: "#fff"
    },
    secondary: {
      light: "#ffe46e",
      main: "#fdb23c",
      dark: "#c58300",
      contrastText: "#000"
    },
    third: {
      light: "#ff6333",
      main: "#ff3d00",
      dark: "#b22a00",
      contrastText: "#000"
    }
  }
});

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
          ...action.key,
          PrivateKey: action.PrivateKey
        }
      };
    default:
      return state;
  }
}

// const loggerMiddleware = dispatch => action => {
//   dispatch(action);
//   process.env.NODE_ENV === "development" && console.log("dispatched:", action);
// };

const App = () => {
  let [state, dispatch] = React.useReducer(appReducer, initialState);

  // dispatch = loggerMiddleware(dispatch);
  // console.log("\tstate", state);

  React.useEffect(() => {
    const server = Server.getDefault();
    if (!server) {
      Server.setDefault();
    }
    getAccountList();
  }, []);

  const getAccountList = async () => {
    dispatch({ type: "LOAD_ACCOUNTS" });
    const result = await Account.getAccountList([]);
    if (result) {
      const accounts = result.Accounts,
        walletName = result.WalletName;
      let accountList = [];

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
    } else {
      alert("Error on get account list. Please restart app!");
    }
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
      const { PrivateKey, ...key } = await Account.getPaymentAddress(
        account.name
      );

      const result = await Account.getPrivateKey(key.PaymentAddress);

      dispatch({
        type: "ADD_ACCOUNT_DATA",
        key,
        PrivateKey: result.PrivateKey
      });
    } catch (e) {
      alert("Error on get account data!");
    }
  }

  return (
    <div className="App">
      {state.showAlert}
      <MuiThemeProvider theme={theme}>
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
          <div className="appContainer">{state.screen}</div>
        </AccountContext.Provider>
      </MuiThemeProvider>
    </div>
  );
};

export default App;
