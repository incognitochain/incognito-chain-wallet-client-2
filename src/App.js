import React from "react";
import "./App.css";
import Header from "./components/layout/Header";
import AccountDetail from "./components/layout/Account/AccountDetail";
import CreateAccount from "./components/pages/Account/Create";
import Settings from "./components/pages/Settings";
import ImportAccount from "./components/pages/Account/Import";
import Snackbar from "@material-ui/core/Snackbar";
import { AccountContext } from "./common/context/AccountContext";
import SplashScreen from "./common/components/splash";
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
import {
  WalletContext,
  useWalletContext
} from "./common/context/WalletContext";
import { appReducer, initialAppState } from "./modules/app/appReducer";
import { useDebugReducer } from "./common/hook/useDebugReducer";
import * as passwordService from "./services/PasswordService";
import Server from "./services/Server";
import * as cacheAccountListService from "./services/CacheListAccountService";

toastr.options.positionClass = "toast-bottom-center";
toastr.options.preventDuplicates = true;

const App = ({ history, location }) => {
  let [state, dispatch] = useDebugReducer("App", appReducer, initialAppState);

  React.useEffect(() => {
    dispatch({
      type: "SET_SCREEN",
      screen: <SplashScreen />
    });
    setTimeout(onInit, 2000);
  }, []);

  async function onInit() {
    initServer();

    if (passwordService.hasPassword()) {
      const wallet = await walletService.loadWallet();

      if (wallet) {
        dispatch({ type: "SET_WALLET", wallet });
        listAccounts(wallet);
      } else {
        promptPassword();
      }
    } else {
      promptPassword();
    }
  }

  function initServer() {
    if (!Server.get()) Server.setDefault();
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
    console.time("listAccounts");
    let accountList = cacheAccountListService.getAccountList();
    console.log("accountList", accountList);
    if (!accountList || accountList.length == 0) {
      accountList = [];
      try {
        accountList = (await wallet.listAccount()).map(account => {
          return {
            default: false,
            name: account["Account Name"],
            value: -1,
            PaymentAddress: account.PaymentAddress,
            ReadonlyKey: account.ReadonlyKey,
            PrivateKey: account.PrivateKey,
            PublicKey: account.PublicKey,
            PublicKeyCheckEncode: account.PublicKeyCheckEncode
          };
        });
      } catch (e) {
        console.error(e);
        alert("Error on get listAccount()!");
      }

      if (accountList.length > 0) {
        cacheAccountListService.saveAccountList(JSON.stringify(accountList));
      }
    } else {
      accountList = JSON.parse(accountList);
    }

    let selectedAccount = {};
    if (accountList.length > 0) {
      console.log("------- AccountList: ------- ", accountList);
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
      screen: <AccountDetail account={selectedAccount} />,
      headerTitle: "Wallet",
      shouldShowHeader: true
    });

    console.timeEnd("listAccounts");
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
      headerTitle = "Wallet";
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
      screen: <AccountDetail />,
      headerTitle: "Wallet",
      shouldShowHeader: true
    });

    if (data && data.message) {
      showSuccess(data.message);
    }
  };
  const handleChangeAccount = account => {
    console.log("HANDLE CHANGE ACCOUNT!!!");
    window.localStorage.setItem(
      "accountIndex",
      state.accounts.indexOf(account)
    );

    dispatch({ type: "SET_SELECTED_ACCOUNT", selectedAccount: account });

    // let {wallet} = useWalletContext();
    // console.log("wallet context: ", wallet);

    // account.history = wallet.getHistoryByAccount(account.name);

    // console.log("history:", history)
    // dispatch({ type: "SET_HISTORY", history});

    dispatch({
      type: "SET_SCREEN",
      screen: <AccountDetail account={account} />,
      shouldShowHeader: true,
      headerTitle: "Wallet"
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
  min-height: 100%;
  height: auto;
  height: fit-content;
  width: 414px;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
`;

const AppContainer = styled.div`
  flex: 1;
  display: flex;
`;
