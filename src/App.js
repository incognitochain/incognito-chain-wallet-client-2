import React from "react";
import "./App.css";
import Header from "./components/layout/Header";
import Home from "./components/pages/Home";
import CreateAccount from "./components/pages/Account/Create";
import Settings from "./components/pages/Settings";
import ImportAccount from "./components/pages/Account/Import";
import Snackbar from "@material-ui/core/Snackbar";
import { AccountContext } from "./common/context/AccountContext";
import { AccountListContext } from "./common/context/AccountListContext";
import {
  Error as IconError,
  CheckCircle as IconSuccess,
  Warning as IconWarning
} from "@material-ui/icons";
import "toastr/build/toastr.css";
import toastr from "toastr";
import styled from "styled-components";
import * as walletService from "./services/WalletService";
import { AppRoute } from "./AppRoute";
import { HashRouter, withRouter } from "react-router-dom";
import { AppContext } from "./common/context/AppContext";
import { WalletContext } from "./common/context/WalletContext";

toastr.options.positionClass = "toast-bottom-center";

const initialState = {
  screen: "",
  headerTitle: "Wallet home",
  showAlert: "",
  isAlert: false,
  selectedAccount: {},
  accounts: [],
  shouldShowHeader: true
};

function appReducer(state = initialState, action) {
  switch (action.type) {
    case "SET_BALANCES":
      console.log("###action.balances", action.balances);
      return {
        ...state,
        accounts: state.accounts.map(account => ({
          ...account,
          value: action.balances.find(
            ({ accountName }) => accountName === account.name
          ).balance
        }))
      };
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
        shouldShowHeader: action.shouldShowHeader,
        headerTitle: action.headerTitle
      };
    case "SET_SELECTED_ACCOUNT":
      return {
        ...state,
        selectedAccount: action.selectedAccount
      };

    case "SET_WALLET":
      return {
        ...state,
        wallet: action.wallet
      };
    default:
      throw new Error("Unknown action type", action);
  }
}

const App = ({ history, location }) => {
  let [state, dispatch] = React.useReducer(appReducer, initialState);
  console.log("###app state", state);
  const walletRef = React.useRef();

  React.useEffect(() => {
    walletRef.current = state.wallet;
  }, [state.wallet]);

  React.useEffect(() => {
    onInit();

    window.onbeforeunload = () => {
      if (walletRef.current) walletService.saveWallet(walletRef.current);
    };
  }, []);

  async function onInit() {
    if (walletService.hasPassword()) {
      const wallet = await walletService.loadWallet();

      if (wallet) {
        listAccounts(wallet);
        dispatch({ type: "SET_WALLET", wallet });
      } else {
        promptPassword();
      }
    } else {
      promptPassword();
    }
  }

  function promptPassword() {
    dispatch({
      type: "SET_SCREEN",
      screen: null,
      headerTitle: "Password",
      shouldShowHeader: false
    });
    history.push("/password");
  }

  async function listAccounts(wallet) {
    let accountList = [];
    try {
      accountList = (await wallet.listAccount()).map(account => {
        return {
          default: false,
          name: account["Account Name"],
          value: -1,
          PaymentAddress: account.PaymentAddress,
          ReadonlyKey: account.ReadonlyKey
        };
      });
    } catch (e) {
      console.error(e);
      alert("Error on get listAccount()!");
    }

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
      walletName: wallet.Name,
      selectedAccount,
      accounts: accountList
    });

    dispatch({
      type: "SET_SCREEN",
      screen: <Home account={selectedAccount} />,
      headerTitle: "Home",
      shouldShowHeader: true
    });
  }

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    dispatch({ type: "CLOSE_ALERT" });
  };

  const selectAccount = action => {
    // TODO - move this to react-router
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

    dispatch({
      type: "SET_SCREEN",
      screen,
      headerTitle,
      shouldShowHeader: true
    });
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
    dispatch({
      type: "SET_SCREEN",
      screen: <Home />,
      headerTitle: "Home",
      shouldShowHeader: true
    });

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
      shouldShowHeader: true,
      headerTitle: "Home"
    });
  };

  return (
    <Wrapper>
      <AppContext.Provider value={{ listAccounts, appDispatch: dispatch }}>
        <AccountListContext.Provider value={state.accounts}>
          <AccountContext.Provider value={state.selectedAccount}>
            <WalletContext.Provider value={{ wallet: state.wallet }}>
              {state.showAlert}

              {state.shouldShowHeader ? (
                <Header
                  callbackSelected={action => {
                    selectAccount(action);
                  }}
                  title={state.headerTitle}
                  accounts={state.accounts}
                  selectedAccount={state.selectedAccount}
                  onChangeAccount={handleChangeAccount}
                />
              ) : null}
              <AppContainer>
                {location.pathname === "/" ? (
                  state.screen /* TODO - move state.screen to react-router */
                ) : (
                  <AppRoute />
                )}
              </AppContainer>
            </WalletContext.Provider>
          </AccountContext.Provider>
        </AccountListContext.Provider>
      </AppContext.Provider>
    </Wrapper>
  );
};

const WithRouterApp = withRouter(App);

export default () => (
  <HashRouter>
    <WithRouterApp />
  </HashRouter>
);

const Wrapper = styled.div`
  background: url(assets/images/bg.png) no-repeat center center;
  margin: 0 auto;
  height: 100vh;
  min-height: 931px;
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
